import { BulkProfilesResponse } from './types/BulkProfilesResponse.js';
import { ProfileResponse } from './types/ProfileResponse.js';

export interface ProfilesApiProvider {
  readonly apiUrl: string;
  /**
   * Get a profile by address or ENS.
   * @param query ETH address or ENS
   * @param options Options to pass to the fetch call.
   * @returns The response from the API.
   */
  getProfile(
    query: string,
    options?: RequestInit,
  ): Promise<ProfileResponse | null>;
  /**
   * Get a list of profiles by ETH address or ENS. Will make multiple requests if
   * the list is too big.
   * @param queries ETH addresses or ENS
   * @param options Options to pass to the fetch call.
   * @returns The list of responses from the API and errors (if any).
   */
  getBulkProfiles(
    queries: string[],
    options?: RequestInit,
  ): Promise<BulkProfilesResponse>;
}
