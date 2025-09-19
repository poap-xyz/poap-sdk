import { AuthToken } from './types/AuthToken';

/**
 * Authentication provider port
 *
 * @Interface AuthenticationProvider
 */
export interface AuthenticationProvider {
  /**
   * Get a JWT from the authentication provider
   * @param audience The audience of the JWT
   * @throws {UnauthorizedClientError}
   */
  getAuthToken(audience: string): Promise<AuthToken>;
}
