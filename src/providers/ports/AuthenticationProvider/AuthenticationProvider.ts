import { AuthToken } from './types/AuthToken';

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
   */
  getAuthToken(audience: string): Promise<AuthToken>;
}
