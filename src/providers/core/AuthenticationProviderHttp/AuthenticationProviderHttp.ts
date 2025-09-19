import { AuthToken } from '../../ports/AuthenticationProvider/types/AuthToken';
import { AuthenticationProvider } from '../../ports/AuthenticationProvider/AuthenticationProvider';

const DEFAULT_OAUTH_SERVER = 'auth.accounts.poap.xyz';

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.1
 */
type AuthTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
};

export class AuthenticationProviderHttp implements AuthenticationProvider {
  private readonly oAuthServerDomain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  /**
   * Internal cache by audience.
   */
  private cache: Record<string, AuthToken> = {};

  constructor(
    clientId: string,
    clientSecret: string,
    oAuthServerDomain?: string,
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.oAuthServerDomain = oAuthServerDomain || DEFAULT_OAUTH_SERVER;

    if (this.oAuthServerDomain.toLowerCase().startsWith('http')) {
      throw new Error('OAuth server domain must not start with HTTP');
    }
  }

  // eslint-disable-next-line max-statements, complexity
  public async getAuthToken(audience: string): Promise<AuthToken> {
    const cachedToken = this.getCachedToken(audience);

    if (cachedToken) {
      return cachedToken;
    }

    const response = await fetch(
      `https://${this.oAuthServerDomain}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          audience,
          grant_type: 'client_credentials',
        }),
      },
    );

    if (!response.ok) {
      let responseData: unknown;
      try {
        responseData = await response.json();
      } catch {
        try {
          responseData = await response.text();
        } catch {}
      }
      throw new Error(
        `Could not authenticate to ${audience}: ` +
          `Network response was not ok: ${response.statusText} ${responseData}`,
      );
    }

    const responseData: unknown = await response.json();

    if (!this.isAuthTokenResponse(responseData)) {
      throw new Error(
        `Could not authenticate to ${audience}: ` +
          `Invalid response: ${responseData}`,
      );
    }

    const authToken = this.transformResponseToAuthToken(responseData);

    this.setCachedToken(audience, authToken);

    return authToken;
  }

  private setCachedToken(audience: string, authToken: AuthToken): void {
    this.cache[audience] = authToken;
  }

  private getCachedToken(audience: string): AuthToken | null {
    const authToken = this.cache[audience];

    if (!authToken || this.isTokenExpired(authToken)) {
      delete this.cache[audience];
      return null;
    }

    return authToken;
  }

  private isTokenExpired(authToken: AuthToken): boolean {
    return authToken.expiresAt != undefined && authToken.expiresAt < new Date();
  }

  // eslint-disable-next-line complexity
  private isAuthTokenResponse(
    authToken: unknown,
  ): authToken is AuthTokenResponse {
    if (
      authToken == undefined ||
      typeof authToken !== 'object' ||
      !('access_token' in authToken) ||
      authToken.access_token == undefined ||
      typeof authToken.access_token !== 'string' ||
      !('token_type' in authToken) ||
      authToken.token_type == undefined ||
      typeof authToken.token_type !== 'string'
    ) {
      return false;
    }

    if (
      'expires_in' in authToken &&
      (authToken.expires_in == undefined ||
        typeof authToken.expires_in !== 'number')
    ) {
      return false;
    }

    if (
      'refresh_token' in authToken &&
      (authToken.refresh_token == undefined ||
        typeof authToken.refresh_token !== 'string')
    ) {
      return false;
    }

    if (
      'scope' in authToken &&
      (authToken.scope == undefined || typeof authToken.scope !== 'string')
    ) {
      return false;
    }

    return true;
  }

  private transformResponseToAuthToken(
    responseData: AuthTokenResponse,
  ): AuthToken {
    return {
      accessToken: responseData.access_token,
      tokenType: responseData.token_type,
      expiresAt: responseData.expires_in
        ? new Date(Date.now() + responseData.expires_in * 1000)
        : undefined,
      refreshToken: responseData.refresh_token,
      scope: responseData.scope,
    };
  }
}
