import { AuthenticationProvider } from '../../ports/AuthenticationProvider/AuthenticationProvider';
import { MissingAuthenticationProviderError } from '../../ports/AuthenticationProvider/errors/MissingAuthenticationProviderError';
import { TokensApiProvider } from '../../ports/TokensApiProvider/TokensApiProvider';
import { MintCodeInput } from '../../ports/TokensApiProvider/types/MintCodeInput';
import {
  GetMintCodeResponse,
  PostMintCodeResponse,
} from '../../ports/TokensApiProvider/types/MintCodeResponse';
import {
  Transaction,
  TransactionStatus,
} from '../../ports/TokensApiProvider/types/Transaction';

const DEFAULT_DROP_BASE_URL = 'https://api.poap.tech';

/**
 * Represents the main interface to interact with the POAP Drop API.
 *
 * @export
 * @class PoapTokenApi
 * @implements {TokensApiProvider}
 */
export class PoapTokenApi implements TokensApiProvider {
  private apiKey: string;
  private baseUrl: string;
  private authenticationProvider?: AuthenticationProvider;

  /**
   * Constructs a new instance of the `PoapTokenApi` class.
   *
   * @constructor
   * @param {PoapTokenApiOptions} options - Configuration options for the API.
   * @param {string} options.apiKey - The API key for authenticating requests.
   * @param {string} [options.baseUrl=DEFAULT_DROP_BASE_URL] - The base URL for the API.
   * @param {AuthenticationProvider} [options.authenticationProvider] - Optional provider for JWT authentication.
   */
  constructor({
    apiKey,
    baseUrl = DEFAULT_DROP_BASE_URL,
    authenticationProvider,
  }: PoapTokenApiOptions) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.authenticationProvider = authenticationProvider;
  }

  /**
   * Retrieves the mint code details.
   *
   * @param {string} qrHash - The unique Mint Code for the mint.
   * @returns {Promise<GetMintCodeResponse>} Details of the mint code.
   */
  async getMintCode(qrHash: string): Promise<GetMintCodeResponse> {
    return await this.secureFetch<GetMintCodeResponse>(
      `${this.baseUrl}/actions/claim-qr?qr_hash=${qrHash}`,
      {
        method: 'GET',
        headers: {},
      },
    );
  }

  /**
   * Posts a new mint code to the API.
   *
   * @param {MintCodeInput} input - The input data for the mint code.
   * @returns {Promise<PostMintCodeResponse>} Response from the mint code creation.
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
    );
  }

  /**
   * Gets the Transaction associated with the mint.
   * The Transaction could change in case of a bump.
   * It returns null if the mint has no transaction associated.
   *
   * @param {string} qrHash - The qrHash of the mint.
   * @returns {Promise<Transaction> | null} The Transaction associated with the mint. Null if no transaction is found.
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
   * @private
   * @template R - Type of the expected response data.
   * @param {string} url - The complete URL for the HTTP request.
   * @param {RequestInit} options - Configuration options for the HTTP request.
   * @returns {Promise<R>} A promise that resolves with the parsed API response.
   */
  private async secureFetch<R>(url: string, options: RequestInit): Promise<R> {
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

    return await response.json();
  }

  /**
   * Retrieves the authorization token for making authenticated requests.
   *
   * @private
   * @throws {MissingAuthenticationProviderError} If no authentication provider is provided.
   * @returns {Promise<string>} The bearer token for authentication.
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
 * @property {string} apiKey - The API key to use for authenticating requests.
 * @property {string} [baseUrl] - The base URL for the API. Defaults to 'https://api.poap.tech'.
 * @property {AuthenticationProvider} [authenticationProvider] - Optional provider for JWT authentication.
 */
export interface PoapTokenApiOptions {
  apiKey: string;
  baseUrl?: string;
  authenticationProvider?: AuthenticationProvider;
}
