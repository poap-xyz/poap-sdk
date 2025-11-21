import { isFilterValueDefined } from '../utils/validation/isFilterValueDefined.js';
import { Drop } from './domain/Drop.js';
import {
  PAGINATED_DROPS_QUERY,
  PaginatedDropsResponse,
  PaginatedDropsVariables,
} from './queries/PaginatedDrop.js';
import {
  SEARCH_DROPS_QUERY,
  SearchDropsResponse,
  SearchDropsVariables,
} from './queries/SearchDrops.js';
import { DropResponse } from './types/DropResponse.js';
import { DropsSortFields } from './types/DropsSortFields.js';
import { CreateDropsInput } from './types/CreateDropsInput.js';
import { UpdateDropsInput } from './types/UpdateDropsInput.js';
import { ListDropsInput } from './types/ListDropsInput.js';
import { SearchDropsInput } from './types/SearchDropsInput.js';
import { CompassProvider, DropApiProvider } from '../providers/index.js';
import {
  createBetweenFilter,
  createEqFilter,
  createInFilter,
  createOrderBy,
  isNumeric,
  nextCursor,
  Order,
  PaginatedResult,
  toPOAPDate,
} from '../utils/index.js';

/**
 * Represents a client for working with POAP drops.
 *
 * @class DropsClient
 */
export class DropsClient {
  /**
   * Creates a new DropsClient object.
   *
   * @constructor
   * @param {CompassProvider} compassProvider - The provider for the POAP compass API.
   * @param {DropApiProvider} dropApiProvider - The provider for the POAP drop API.
   */
  constructor(
    private compassProvider: CompassProvider,
    private dropApiProvider: DropApiProvider,
  ) {}

  /**
   * Fetches drops based on the specified input.
   *
   * @param input.sortField The field to sort the drops by.
   * @param input.sortDir The direction to sort the drops (ascending or descending).
   * @param input.from The start date to filter drops from.
   * @param input.to The end date to filter drops to.
   * @param input.ids An array of drop IDs to filter by.
   * @param input.limit The maximum number of drops to return.
   * @param input.offset The number of drops to skip before starting to collect the result set.
   * @param options Additional options to pass to the fetch call.
   *
   * @returns A paginated result of drops.
   */
  async list(
    input: ListDropsInput,
    options?: RequestInit,
  ): Promise<PaginatedResult<Drop, number>> {
    const { limit, offset, sortField, sortDir, from, to, ids } = input;

    const isDateRangeDefined =
      isFilterValueDefined(from) || isFilterValueDefined(to);

    const variables: PaginatedDropsVariables = {
      limit,
      offset,
      orderBy: createOrderBy<DropsSortFields>(sortField, sortDir),
      where: {
        ...(isDateRangeDefined && {
          _and: [
            createBetweenFilter('start_date', from, to),
            createBetweenFilter('end_date', from, to),
          ],
        }),
        ...createInFilter('id', ids),
      },
    };

    const { data } = await this.compassProvider.request<
      PaginatedDropsResponse,
      PaginatedDropsVariables
    >(PAGINATED_DROPS_QUERY, variables, options);

    const drops = data.drops.map(
      (drop: DropResponse): Drop => Drop.fromCompass(drop),
    );

    return new PaginatedResult<Drop, number>(
      drops,
      nextCursor(drops.length, limit, offset),
    );
  }

  /**
   * Fetches a single drop by ID.
   * @param id The ID of the drop to fetch.
   * @param options Additional options to pass to the fetch call.
   * @returns The drop with the specified ID, or null if not found.
   *
   */
  async get(id: number, options?: RequestInit): Promise<Drop | null> {
    const { data } = await this.compassProvider.request<
      PaginatedDropsResponse,
      PaginatedDropsVariables
    >(
      PAGINATED_DROPS_QUERY,
      {
        offset: 0,
        limit: 1,
        orderBy: createOrderBy<DropsSortFields>(DropsSortFields.Id, Order.DESC),
        where: createEqFilter('id', id),
      },
      options,
    );

    if (!data.drops.length) {
      return null;
    }

    return Drop.fromCompass(data.drops[0]);
  }

  /**
   * Searches drops based on the specified input.
   *
   * @async
   * @method
   * @param {SearchDropsInput} input - The input for searching drops.
   * @param {RequestInit} options - Additional options to pass to the fetch call.
   * @returns {Promise<PaginatedResult<Drop>>} A paginated result of drops.
   */
  async search(
    input: SearchDropsInput,
    options?: RequestInit,
  ): Promise<PaginatedResult<Drop, number>> {
    const { search, offset, limit } = input;

    if (!search.trim()) {
      return new PaginatedResult<Drop, number>([], null);
    }

    const variables: SearchDropsVariables = {
      limit,
      offset,
      ...(isNumeric(search) && { orderBy: { id: Order.ASC } }),
      args: {
        search,
      },
    };

    const { data } = await this.compassProvider.request<
      SearchDropsResponse,
      SearchDropsVariables
    >(SEARCH_DROPS_QUERY, variables, options);

    const drops = data.search_drops.map(
      (drop: DropResponse): Drop => Drop.fromCompass(drop),
    );

    return new PaginatedResult<Drop, number>(
      drops,
      nextCursor(drops.length, limit, offset),
    );
  }

  /**
   * Creates a new drop.
   *
   * @async
   * @method
   * @param {CreateDropsInput} input - The input for creating a new drop.
   * @returns {Promise<Drop>} The newly created drop.
   */
  async create(input: CreateDropsInput): Promise<Drop> {
    const response = await this.dropApiProvider.createDrop({
      name: input.name,
      description: input.description,
      city: input.city,
      country: input.country,
      start_date:
        input.startDate instanceof Date
          ? toPOAPDate(input.startDate)
          : input.startDate,
      end_date:
        input.endDate instanceof Date
          ? toPOAPDate(input.endDate)
          : input.endDate,
      expiry_date:
        input.expiryDate instanceof Date
          ? toPOAPDate(input.expiryDate)
          : input.expiryDate,
      event_url: input.eventUrl,
      virtual_event: input.virtualEvent,
      image: input.image,
      filename: input.filename,
      contentType: input.contentType,
      secret_code: input.secretCode,
      event_template_id: input.eventTemplateId,
      email: input.email,
      requested_codes: input.requestedCodes,
      private_event: input.privateEvent,
    });
    return Drop.fromProvider(response);
  }

  /**
   * Updates an existing drop.
   *
   * @async
   * @method
   * @param {UpdateDropsInput} input - The input for updating an existing drop.
   * @returns {Promise<Drop>} The updated drop.
   */
  async update(input: UpdateDropsInput): Promise<Drop> {
    const response = await this.dropApiProvider.updateDrop({
      name: input.name,
      description: input.description,
      country: input.country,
      city: input.city,
      start_date: input.startDate,
      end_date: input.endDate,
      expiry_date: input.expiryDate,
      event_url: input.eventUrl,
      virtual_event: input.virtualEvent,
      private_event: input.privateEvent,
      event_template_id: input.eventTemplateId,
      secret_code: input.secretCode,
    });
    return Drop.fromProvider(response);
  }
}
