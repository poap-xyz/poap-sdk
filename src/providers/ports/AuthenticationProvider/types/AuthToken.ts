/**
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
 */
export interface AuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt?: Date;
  refreshToken?: string;
  scope?: string;
}
