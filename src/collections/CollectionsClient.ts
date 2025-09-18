import { CompassProvider } from '../providers';
import {
  createInFilter,
  createOrderBy,
  nextCursor,
  Order,
  PaginatedResult,
} from '../utils';

import { Collection } from './domain/Collection';
import { CollectionResponse } from './types/CollectionResponse';
import { ListCollectionsInput } from './types/ListCollectionsInput';
import {
  PAGINATED_COLLECTIONS_QUERY,
  PaginatedCollectionsResponse,
  PaginatedCollectionsVariables,
} from './queries/PaginatedCollections';
import {
  SEARCH_COLLECTIONS_QUERY,
  SearchCollectionsResponse,
  SearchCollectionsVariables,
} from './queries/SearchCollections';
import { SearchCollectionsInput } from './types/SearchCollectionsInput';
import {
  COLLECTION_DROP_IDS_QUERY,
  CollectionDropIdsResponse,
  CollectionDropIdsVariables,
} from './queries/CollectionDropIds';
import {
  COLLECTION_QUERY,
  CollectionQueryResponse,
  CollectionQueryVariables,
} from './queries/Collection';

export class CollectionsClient {
  constructor(private compassProvider: CompassProvider) {}

  /**
   * Fetches collections based on the specified input.
   * @param input.ids The list of collection IDs to fetch. Optional.
   * @param input.withDropIds Include all drop IDs of the Collection in the response. Default is false.
   * @param input.offset The number of collections to skip before starting to collect the result set.
   * @param input.limit The maximum number of collections to return. Maximum is 100.
   * @param options Additional options to pass to the fetch call.
   * @returns A paginated result of collections.
   */
  async list(
    input: ListCollectionsInput,
    options?: RequestInit,
  ): Promise<PaginatedResult<Collection, number>> {
    const variables: PaginatedCollectionsVariables = {
      limit: input.limit,
      offset: input.offset,
      orderBy: createOrderBy('id', Order.DESC),
      where: createInFilter('id', input.ids),
    };

    const { data } = await this.compassProvider.request<
      PaginatedCollectionsResponse,
      PaginatedCollectionsVariables
    >(PAGINATED_COLLECTIONS_QUERY, variables, options);

    const collections = data.collections.map((collection: CollectionResponse) =>
      Collection.fromResponse(collection),
    );

    return new PaginatedResult<Collection, number>(
      collections,
      nextCursor(collections.length, input.limit, input.offset),
    );
  }

  /**
   * Searches for collections based on the specified input.
   * @param input.query The search query string.
   * @param input.withDropIds Include all drop IDs of the Collection in the response. Default is false.
   * @param input.offset The number of collections to skip before starting to collect the result set.
   * @param input.limit The maximum number of collections to return. Maximum is 100.
   * @param options Additional options to pass to the fetch call.
   * @returns A paginated result of collections matching the search query.
   */
  async search(
    input: SearchCollectionsInput,
    options?: RequestInit,
  ): Promise<PaginatedResult<Collection, number>> {
    if (!input.query.trim()) {
      return new PaginatedResult<Collection, number>([], null);
    }

    const variables: SearchCollectionsVariables = {
      ...input,
      orderBy: createOrderBy('id', Order.DESC),
    };

    const { data } = await this.compassProvider.request<
      SearchCollectionsResponse,
      SearchCollectionsVariables
    >(SEARCH_COLLECTIONS_QUERY, variables, options);

    const collections = data.search_collections.map(
      (collection: CollectionResponse) => Collection.fromResponse(collection),
    );

    return new PaginatedResult<Collection, number>(
      collections,
      nextCursor(collections.length, input.limit, input.offset),
    );
  }

  /**
   * Get a single collection by ID.
   * @param id The ID of the collection to fetch.
   * @returns The collection if found, otherwise null.
   */
  async get(id: number, options?: RequestInit): Promise<Collection | null> {
    const [{ data }, dropIds] = await Promise.all([
      this.compassProvider.request<
        CollectionQueryResponse,
        CollectionQueryVariables
      >(COLLECTION_QUERY, { id }, options),
      this.listDropIds(id),
    ]);

    if (!data.collections.length) {
      return null;
    }

    return Collection.fromResponse(data.collections[0], dropIds);
  }

  /**
   * Get the list of all drop IDs in a collection.
   * @param id The ID of the collection.
   * @returns An array of drop IDs.
   */
  private async listDropIds(id: number): Promise<number[]> {
    const { data } = await this.compassProvider.request<
      CollectionDropIdsResponse,
      CollectionDropIdsVariables
    >(COLLECTION_DROP_IDS_QUERY, { id });

    if (!data.collections_collection_drop_ids.length) {
      return [];
    }

    return data.collections_collection_drop_ids[0].drop_ids;
  }
}
