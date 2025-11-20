import { AuthenticationProvider } from '../../ports/AuthenticationProvider/AuthenticationProvider.js';
import { MissingAuthenticationProviderError } from '../../ports/AuthenticationProvider/errors/MissingAuthenticationProviderError.js';
import { TokensApiProvider } from '../../ports/TokensApiProvider/TokensApiProvider.js';
import { MintCodeInput } from '../../ports/TokensApiProvider/types/MintCodeInput.js';
import {
  GetMintCodeResponse,
  PostMintCodeResponse,
} from '../../ports/TokensApiProvider/types/MintCodeResponse.js';
import {
  Transaction,
  TransactionStatus,
} from '../../ports/TokensApiProvider/types/Transaction.js';
import { AddressAlreadyMintDropError } from '../../ports/TokensApiProvider/errors/AddressAlreadyMintDropError.js';
import { MintCodeAlreadyUsedError } from '../../ports/TokensApiProvider/errors/MintCodeAlreadyUsedError.js';
import { MintCodeExpiredError } from '../../ports/TokensApiProvider/errors/MintCodeExpiredError.js';
import { MintCodeNotFoundError } from '../../ports/TokensApiProvider/errors/MintCodeNotFoundError.js';
import { InvalidAddressError } from '../../ports/TokensApiProvider/errors/InvalidAddressError.js';

const DEFAULT_POAPS_BASE_URL = 'https://api.poap.tech';

/**
 * Represents the main interface to interact with the POAP Drop API.
 */
export class PoapTokenApi implements TokensApiProvider {
  private apiKey: string;
  private baseUrl: string;
  private authenticationProvider?: AuthenticationProvider;

  /**
   * Constructs a new instance of the `PoapTokenApi` class.
   *
   * @param options - Configuration options for the API.
   * @param options.apiKey - The API key for authenticating requests.
   * @param options.baseUrl - The base URL for the API.
   * @param options.authenticationProvider - Optional provider for JWT authentication.
   */
  constructor({
    apiKey,
    baseUrl = DEFAULT_POAPS_BASE_URL,
    authenticationProvider,
  }: PoapTokenApiOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.authenticationProvider = authenticationProvider;
  }

  async checkMintCode(qrHash: string): Promise<void> {
    const getMintCodeResponse = await this.getMintCode(qrHash);

    if (getMintCodeResponse.claimed) {
      throw new MintCodeAlreadyUsedError(qrHash);
    }

    if (!getMintCodeResponse.is_active) {
      throw new MintCodeExpiredError(qrHash);
    }
  }

  /**
   * Retrieves the mint code details.
   *
   * @param qrHash - The unique Mint Code for the mint.
   * @returns Details of the mint code.
   */
  async getMintCode(qrHash: string): Promise<GetMintCodeResponse> {
    return await this.secureFetch<GetMintCodeResponse>(
      `${this.baseUrl}/actions/claim-qr?qr_hash=${qrHash}`,
      {
        method: 'GET',
        headers: {},
      },
      async (response: Response): Promise<never> => {
        if (response.status === 400 || response.status === 404) {
          throw new MintCodeNotFoundError(qrHash);
        }

        throw new Error(
          `Unexpected response ${response.status} while scanning`,
        );
      },
    );
  }

  /**
   * Posts a new mint code to the API.
   *
   * @param input - The input data for the mint code.
   * @returns Response from the mint code creation.
   */
  async postMintCode(input: MintCodeInput): Promise<PostMintCodeResponse> {
    return await this.secureFetch<PostMintCodeResponse>(
      `${this.baseUrl}/actions/claim-qr`,
      {
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      // eslint-disable-next-line max-statements, complexity
      async (response: Response): Promise<never> => {
        const message = await this.getResponseMessage(
          response,
          'Unexpected error',
        );

        if (response.status === 400) {
          if (message.includes('Address is not valid')) {
            throw new InvalidAddressError(input.address);
          }

          if (message.includes('QR Claim expired')) {
            throw new MintCodeExpiredError(input.qr_hash);
          }

          if (message.includes('QR Claim already claimed')) {
            throw new MintCodeAlreadyUsedError(input.qr_hash);
          }

          if (message.includes('You already minted a POAP for this drop.')) {
            throw new AddressAlreadyMintDropError(input.address);
          }
        }

        if (response.status === 404) {
          throw new MintCodeNotFoundError(input.qr_hash);
        }

        throw new Error(`Unexpected response ${response.status} while minting`);
      },
    );
  }

  /**
   * Gets the Transaction associated with the mint.
   * The Transaction could change in case of a bump.
   * It returns null if the mint has no transaction associated.
   *
   * @param qrHash - The qrHash of the mint.
   * @returns The Transaction associated with the mint. Null if no transaction is found.
   */
  async getMintTransaction(qrHash: string): Promise<Transaction | null> {
    const transactions = await this.secureFetch<{
      total: number;
      transactions: Transaction[];
    }>(`${this.baseUrl}/transactions?qr_hash=${qrHash}`, {
      method: 'GET',
    });

    if (transactions.total === 0) {
      return null;
    }

    const status = transactions.transactions[0].status;

    if (status === TransactionStatus.waiting) {
      return null;
    }

    return transactions.transactions[0];
  }

  /**
   * Sends a secure HTTP request to the POAP API with proper headers.
   *
   * @template R - Type of the expected response data.
   * @param url - The complete URL for the HTTP request.
   * @param options - Configuration options for the HTTP request.
   * @returns A promise that resolves with the parsed API response.
   */
  private async secureFetch<R>(
    url: string,
    options: RequestInit,
    handleError?: (response: Response) => Promise<never>,
  ): Promise<R> {
    const headersWithApiKey = {
      ...options.headers,
      'x-api-key': this.apiKey,
      Authorization: await this.getAuthorizationToken(),
    };

    const response = await fetch(url, {
      ...options,
      method: options.method,
      body: options.body,
      headers: headersWithApiKey,
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      await (handleError ?? this.handleError)(response);
    }

    return await response.json();
  }

  private async getResponseMessage(
    response: Response,
    defaultMessage: string,
  ): Promise<string> {
    try {
      const body = await response.json();
      return body?.message || defaultMessage;
    } catch {
      return defaultMessage;
    }
  }

  private async handleError(response: Response): Promise<never> {
    const message = await this.getResponseMessage(response, 'Unexpected error');
    throw new Error(`Failed to fetch ${response.url} | ${message}`);
  }

  /**
   * Retrieves the authorization token for making authenticated requests.
   *
   * @throws {MissingAuthenticationProviderError} If no authentication provider is provided.
   * @returns The bearer token for authentication.
   */
  private async getAuthorizationToken(): Promise<string> {
    if (!this.authenticationProvider) {
      throw new MissingAuthenticationProviderError();
    }

    const authToken = await this.authenticationProvider.getAuthToken(
      this.baseUrl,
    );

    return `Bearer ${authToken.accessToken}`;
  }
}

/**
 * Represents the configuration options required when instantiating the `PoapTokenApi` class.
 *
 * @property apiKey - The API key to use for authenticating requests.
 * @property baseUrl - The base URL for the API. Defaults to 'https://api.poap.tech'.
 * @property authenticationProvider - Optional provider for JWT authentication.
 */
export interface PoapTokenApiOptions {
  apiKey: string;
  baseUrl?: string;
  authenticationProvider?: AuthenticationProvider;
}
