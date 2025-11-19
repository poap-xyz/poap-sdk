import chunk from 'lodash.chunk';
import { BulkProfilesResponse } from '../../ports/ProfilesApiProvider/types/BulkProfilesResponse.js';
import { ProfileResponse } from '../../ports/ProfilesApiProvider/types/ProfileResponse.js';
import { ProfilesApiProvider } from '../../ports/ProfilesApiProvider/index.js';

const DEFAULT_PROFILES_API_URL = 'https://profiles.poap.tech';
const REQUEST_PARAM_COUNT_LIMIT = 50;
const BATCH_REQUEST_SIZE = 5;

export class PoapProfilesApi implements ProfilesApiProvider {
  readonly apiUrl: string;

  constructor(params: { apiUrl?: string }) {
    this.apiUrl = params.apiUrl ?? DEFAULT_PROFILES_API_URL;
  }

  /**
   * Get a profile by address or ENS.
   * @param query ETH address or ENS
   * @param options Options to pass to the fetch call.
   * @returns The response from the API.
   */
  async getProfile(
    query: string,
    options?: RequestInit,
  ): Promise<ProfileResponse | null> {
    try {
      return await this.request<ProfileResponse>(
        `/profile/${encodeURIComponent(query)}`,
        options,
      );
    } catch {
      return null;
    }
  }

  /**
   * Get a list of profiles by ETH address or ENS. Will make multiple requests if
   * the list is too big.
   * @param queries ETH addresses or ENS
   * @param options Options to pass to the fetch call.
   * @returns The list of responses from the API and errors (if any).
   */
  async getBulkProfiles(
    queries: string[],
    options?: RequestInit,
  ): Promise<BulkProfilesResponse> {
    if (queries.length === 0) {
      return { profiles: [] };
    }

    if (queries.length === 1) {
      const profile = await this.getProfile(queries[0], options);
      return { profiles: profile ? [profile] : [] };
    }

    const batchResult = await this.batchBulkProfilesRequest(queries, options);
    return batchResult.reduce<BulkProfilesResponse>(
      (acc, response) => {
        acc.profiles.push(...response.profiles);
        if (response.errors) {
          acc.errors = (acc.errors || []).concat(response.errors);
        }
        return acc;
      },
      { profiles: [], errors: [] },
    );
  }

  private async batchBulkProfilesRequest(
    queries: string[],
    options?: RequestInit,
  ): Promise<BulkProfilesResponse[]> {
    const results: BulkProfilesResponse[] = [];
    const requests = chunk(queries, REQUEST_PARAM_COUNT_LIMIT);
    const chunks = chunk(requests, BATCH_REQUEST_SIZE);

    for (const chunk of chunks) {
      const responses = await Promise.allSettled(
        chunk.map((queries) =>
          this.request<BulkProfilesResponse>(
            `/bulk/profile/${queries.map((query) => encodeURIComponent(query)).join(',')}`,
            options,
          ),
        ),
      );
      const successResponses = responses.reduce<BulkProfilesResponse[]>(
        (acc, response) =>
          response.status === 'fulfilled' ? [...acc, response.value] : acc,
        [],
      );
      results.push(...successResponses);
    }

    return results;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiUrl}${path}`, options);
    if (!response.ok) {
      await this.handleError(response);
    }
    return await response.json();
  }

  private async handleError(response: Response): Promise<never> {
    try {
      const body = await response.json();
      throw new Error(
        `Failed to fetch ${response.url} | ${body?.message || 'Unexpected error'}`,
      );
    } catch {
      throw new Error(`Failed to fetch ${response.url} | Unexpected error`);
    }
  }
}
