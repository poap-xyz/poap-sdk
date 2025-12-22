import { ProfilesQueryNormalizer } from 'src/profiles/utils/ProfileQueryNormalizer.js';
import { ProfilesApiProvider } from '../providers/index.js';
import { Profile } from './domain/Profile.js';
import { FetchBulkProfilesResponse } from './dtos/FetchBulkProfilesResponse.js';
import { ProfilesMapper } from './utils/ProfilesMapper.js';

export class ProfilesClient {
  /**
   * @constructor
   * @param profileApiProvider The provider for the POAP profile API.
   */
  constructor(private profileApiProvider: ProfilesApiProvider) {}

  /**
   * @param query The ETH address or ENS.
   * @param options Options to pass to the fetch call.
   * @returns The profile, or null if not found.
   */
  async fetch(query: string, options?: RequestInit): Promise<Profile | null> {
    const normalizedQuery = ProfilesQueryNormalizer.normalizeQuery(query);
    if (!normalizedQuery) {
      return null;
    }

    const response = await this.profileApiProvider.getProfile(
      normalizedQuery,
      options,
    );
    if (!response) {
      return null;
    }
    return Profile.fromResponse(response, this.profileApiProvider.apiUrl);
  }

  /**
   * Fetch profiles in bulk.
   *
   * @example
   * ```typescript
   * const address1 = '0x1234...';
   * const address2 = '0x5678...';
   * const { profiles, errors } = await profilesClient.fetchBulk([address1, address2]);
   * console.log(profiles.get(address1)?.ens); // 'test.eth'
   * console.log(profiles.get('test.eth')?.address); // '0x1234...'
   * console.log(profiles.get(address2)?.ens); // undefined
   * console.log(errors.get(address2)?.message); // 'Failed to resolve data from the blockchain'
   * ```
   *
   * Note: If a query fails due to a technical issue, it will be in the `errors` map.
   * You can use this to implement a retry strategy for failed queries.
   * Profiles which do not exist will not be included in the `profiles` map nor result in an error.
   *
   * @param queries The ETH addresses or ENS.
   * @param options Options to pass to the fetch call.
   * @returns A map of input addresses (ETH address or ENS) to profiles, and a map of failed queries to errors.
   */
  async fetchBulk(
    queries: string[],
    options?: RequestInit,
  ): Promise<FetchBulkProfilesResponse> {
    const normalizedQueries = ProfilesQueryNormalizer.normalizeQueries(queries);

    const { profiles, errors } = await this.profileApiProvider.getBulkProfiles(
      normalizedQueries,
      options,
    );

    return {
      profiles: ProfilesMapper.createProfilesMap(
        profiles,
        this.profileApiProvider.apiUrl,
      ),
      errors: ProfilesMapper.createErrorsMap(errors || []),
    };
  }
}
