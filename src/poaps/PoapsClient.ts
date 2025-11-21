import { POAP } from './domain/POAP.js';
import { POAPReservation } from './domain/POAPReservation.js';
import {
  buildPaginatedPoapsQuery,
  PaginatedPoapsVariables,
  PaginatedPoapsResponse,
  POAPS_COUNT_QUERY,
  PoapsCountResponse,
  PoapsCountVariables,
} from './queries/PaginatedPoaps.js';
import {
  FetchPoapsInput,
  FetchPoapsPaginatedInput,
} from './types/FetchPoapsInput.js';
import { PoapsSortFields } from './types/PoapsSortFields.js';
import { PoapMintStatus } from './types/PoapMintStatus.js';
import { WalletMintInput } from './types/WalletMintInput.js';
import { EmailReservationInput } from './types/EmailReservationInput.js';
import { PoapMintTransaction } from './types/PoapMintTransaction.js';
import { PoapsClientOptions } from './types/PoapsClientOptions.js';
import { MintChecker } from './utils/MintChecker.js';
import { PoapIndexed } from './utils/PoapIndexed.js';
import { PoapMintFinishedWithError } from './errors/PoapMintFinishedWithError.js';
import { CompassProvider, TokensApiProvider } from '../providers/index.js';
import {
  createAddressFilter,
  createBetweenFilter,
  createEqFilter,
  createInFilter,
  createNotNullAddressFilter,
  createOrderBy,
  FilterVariables,
  nextCursor,
  Order,
  PaginatedResult,
} from '../utils/index.js';

/**
 * Represents a client for interacting with POAPs.
 */
export class PoapsClient {
  constructor(
    private readonly compassProvider: CompassProvider,
    private readonly tokensApiProvider: TokensApiProvider,
    private readonly options?: PoapsClientOptions,
  ) {}

  /**
   * Retrieves a single POAP token by ID.
   *
   * @param id The token ID.
   * @param options Additional options to pass to the fetch call.
   * @returns A single token or null when not found.
   */
  async get(id: number, options?: RequestInit): Promise<POAP | null> {
    const { data } = await this.compassProvider.request<
      PaginatedPoapsResponse,
      PaginatedPoapsVariables
    >(
      buildPaginatedPoapsQuery({
        withMintingStats: true,
        withCollectorStats: true,
        withDropStats: true,
      }),
      {
        offset: 0,
        limit: 1,
        orderBy: createOrderBy<PoapsSortFields>(PoapsSortFields.Id, Order.DESC),
        where: createEqFilter('id', id),
      },
      options,
    );

    if (!data.poaps.length) {
      return null;
    }

    return POAP.fromCompass(data.poaps[0]);
  }

  /**
   * Fetches a list of POAP tokens based on the given input criteria.
   *
   * @param input Criteria for fetching POAP tokens.
   * @param options Additional options to pass to the fetch call.
   * @returns A paginated list of POAP tokens.
   */
  async list(
    input: FetchPoapsPaginatedInput,
    options?: RequestInit,
  ): Promise<PaginatedResult<POAP>> {
    const {
      limit,
      offset,
      sortField,
      sortDir,
      withMintingStats,
      withCollectorStats,
      withDropStats,
    } = input;

    const query = buildPaginatedPoapsQuery({
      withMintingStats: withMintingStats ?? false,
      withCollectorStats: withCollectorStats ?? false,
      withDropStats: withDropStats ?? false,
    });

    const variables: PaginatedPoapsVariables = {
      ...this.buildPoapsQueryVariables(input),
      limit,
      offset,
      orderBy: createOrderBy<PoapsSortFields>(sortField, sortDir),
    };

    const { data } = await this.compassProvider.request<
      PaginatedPoapsResponse,
      PaginatedPoapsVariables
    >(query, variables, options);

    const poaps = data.poaps.map((poap) => POAP.fromCompass(poap));

    return new PaginatedResult<POAP>(
      poaps,
      nextCursor(poaps.length, limit, offset),
    );
  }

  /**
   * @param input Criteria for fetching the number of POAPs.
   * @param options Additional options to pass to the fetch call.
   * @returns The number of POAPs matching the criteria.
   */
  async count(input?: FetchPoapsInput, options?: RequestInit): Promise<number> {
    const variables: PoapsCountVariables = this.buildPoapsQueryVariables(input);

    const { data } = await this.compassProvider.request<
      PoapsCountResponse,
      PoapsCountVariables
    >(POAPS_COUNT_QUERY, variables, options);

    return data.poaps_aggregate.aggregate.count;
  }

  private buildPoapsQueryVariables(input?: FetchPoapsInput): FilterVariables {
    const {
      chain,
      collectorAddress,
      mintedDateFrom,
      mintedDateTo,
      ids,
      dropId,
      filterZeroAddress = true,
      filterDeadAddress = true,
    } = input || {};
    return {
      where: {
        ...createAddressFilter('collector_address', collectorAddress),
        ...(collectorAddress == undefined
          ? createNotNullAddressFilter(
              'collector_address',
              filterZeroAddress,
              filterDeadAddress,
            )
          : {}),
        ...createEqFilter('chain', chain),
        ...createEqFilter('drop_id', dropId),
        ...createBetweenFilter('minted_on', mintedDateFrom, mintedDateTo),
        ...createInFilter('id', ids),
      },
    };
  }

  /**
   * Retrieves mint code details for a specific Mint Code.
   *
   * @async
   * @param {string} mintCode - The Mint Code for which to get the mint code.
   * @returns {Promise<PoapMintStatus>} The Mint status.
   */
  async getMintCode(mintCode: string): Promise<PoapMintStatus> {
    const getMintCodeRaw = await this.tokensApiProvider.getMintCode(mintCode);
    return {
      minted: getMintCodeRaw.claimed,
      isActive: getMintCodeRaw.is_active,
      poapId: getMintCodeRaw.result?.token,
    };
  }

  /**
   * Awaits until we have a final Transaction status for a specific Mint Code.
   *
   * @returns The final transaction.
   * @param mintCode - The Mint Code
   */
  public async waitMintStatus(mintCode: string): Promise<PoapMintTransaction> {
    const checker = new MintChecker(
      this.tokensApiProvider,
      mintCode,
      this.options?.maxRetries,
      this.options?.initialDelay,
      this.options?.backoffFactor,
    );
    return await checker.checkMintStatus();
  }

  /**
   * Awaits until a specific POAP, identified by its Mint Code, is indexed on our database.
   *
   * @param mintCode - The Mint Code identifying the POAP to be indexed.
   * @returns The status of the POAP mint.
   */
  public async waitPoapIndexed(mintCode: string): Promise<PoapMintStatus> {
    const checker = new PoapIndexed(
      this.tokensApiProvider,
      mintCode,
      this.options?.maxRetries,
      this.options?.initialDelay,
      this.options?.backoffFactor,
    );
    return await checker.waitPoapIndexed();
  }

  /**
   * Begins an asynchronous mint process and provides a unique queue ID in return.
   *
   * @param input - Details required for the mint.
   */
  public async mintAsync(input: WalletMintInput): Promise<void> {
    await this.tokensApiProvider.checkMintCode(input.mintCode);

    await this.tokensApiProvider.postMintCode({
      address: input.address,
      qr_hash: input.mintCode,
      sendEmail: false,
    });
  }

  /**
   * Starts a synchronous mint process. The method waits for the mint to be processed and then
   * fetches the associated POAP. It combines the asynchronous mint and subsequent status checking
   * into a synchronous process for ease of use.
   *
   * @param input - Details needed for the mint.
   * @returns The associated POAP upon successful mint completion.
   * @throws {PoapMintFinishedWithError} If there's an error concluding the mint process.
   */
  async mintSync(input: WalletMintInput): Promise<POAP> {
    await this.mintAsync(input);

    await this.waitMintStatus(input.mintCode);

    const getCodeResponse = await this.waitPoapIndexed(input.mintCode);

    const poap = await this.get(getCodeResponse.poapId);

    if (!poap) {
      throw new PoapMintFinishedWithError(
        'Token is not yet available',
        input.mintCode,
      );
    }

    return poap;
  }

  /**
   * Reserves a POAP to an email address and provides reservation details.
   *
   * @param input - Information for the reservation.
   * @returns The reservation details of the POAP.
   */
  public async emailReservation(
    input: EmailReservationInput,
  ): Promise<POAPReservation> {
    await this.tokensApiProvider.checkMintCode(input.mintCode);

    const response = await this.tokensApiProvider.postMintCode({
      address: input.email,
      qr_hash: input.mintCode,
      sendEmail: input.sendEmail || true,
    });

    return new POAPReservation({
      email: input.email,
      dropId: response.event.id,
      imageUrl: response.event.image_url,
      city: response.event.city,
      country: response.event.country,
      description: response.event.description,
      startDate: new Date(response.event.start_date),
      endDate: new Date(response.event.end_date),
      name: response.event.name,
    });
  }
}
