import { AuthToken } from './types/AuthToken.js';

/**
 * An authentication providers implements a way to connect to an API.
 */
export interface AuthenticationProvider {
  /**
   * Ask for a new authentication token that can be used to communicate with
   * the API given in the `audience` argument.
   *
   * @param audience The audience of the API
   * @throws {UnauthorizedClientError}
   * @throws {RateLimitReachedError} when too many tokens are requested
   */
  getAuthToken(audience: string): Promise<AuthToken>;
}
