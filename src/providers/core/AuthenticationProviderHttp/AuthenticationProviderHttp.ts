import { AuthToken } from '../../ports/AuthenticationProvider/types/AuthToken';
import { AuthenticationProvider } from '../../ports/AuthenticationProvider/AuthenticationProvider';
import { UnauthorizedClientError } from '../../ports/AuthenticationProvider/errors/UnauthorizedClientError';

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

/**
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
 */
type ErrorResponse = {
  error:
    | 'invalid_request'
    | 'invalid_client'
    | 'invalid_grant'
    | 'unauthorized_client'
    | 'unsupported_grant_type'
    | 'invalid_scope';
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

  // eslint-disable-next-line max-statements
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

    if (response.status === 401) {
      throw new UnauthorizedClientError(audience, this.clientId);
    }

    if (!response.ok) {
      const errorResponse = await this.parseErrorResponse(audience, response);

      if (errorResponse.error === 'unauthorized_client') {
        throw new UnauthorizedClientError(audience, this.clientId);
      }

      throw new Error(
        `Could not authenticate to ${audience}: ` +
          `Network response was not ok: ${response.statusText} ${errorResponse.error}`,
      );
    }

    const authTokenResponse = await this.parseSuccessResponse(
      audience,
      response,
    );

    const authToken = this.transformResponseToAuthToken(authTokenResponse);

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

  private async parseErrorResponse(
    audience: string,
    response: Response,
  ): Promise<ErrorResponse> {
    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch (error: unknown) {
      throw new Error(
        `Could not autenticate to ${audience}: Cannot parse response`,
        { cause: error },
      );
    }

    if (!this.isErrorResponse(responseData)) {
      throw new Error(
        `Could not authenticate to ${audience}: ` +
          `Invalid response: ${JSON.stringify(responseData)}`,
      );
    }

    return responseData;
  }

  // eslint-disable-next-line complexity
  private isErrorResponse(
    responseData: unknown,
  ): responseData is ErrorResponse {
    if (
      responseData == undefined ||
      typeof responseData !== 'object' ||
      !('error' in responseData) ||
      responseData.error == undefined ||
      typeof responseData.error !== 'string' ||
      ![
        'invalid_request',
        'invalid_client',
        'invalid_grant',
        'unauthorized_client',
        'unsupported_grant_type',
        'invalid_scope',
      ].includes(responseData.error)
    ) {
      return false;
    }

    return true;
  }

  private async parseSuccessResponse(
    audience: string,
    response: Response,
  ): Promise<AuthTokenResponse> {
    let responseData: unknown;
    try {
      responseData = await response.json();
    } catch (error: unknown) {
      throw new Error(
        `Could not autenticate to ${audience}: Cannot parse response`,
        { cause: error },
      );
    }

    if (!this.isAuthTokenResponse(responseData)) {
      throw new Error(
        `Could not authenticate to ${audience}: ` +
          `Invalid response: ${JSON.stringify(responseData)}`,
      );
    }

    return responseData;
  }

  // eslint-disable-next-line complexity
  private isAuthTokenResponse(
    responseData: unknown,
  ): responseData is AuthTokenResponse {
    if (
      responseData == undefined ||
      typeof responseData !== 'object' ||
      !('access_token' in responseData) ||
      responseData.access_token == undefined ||
      typeof responseData.access_token !== 'string' ||
      !('token_type' in responseData) ||
      responseData.token_type == undefined ||
      typeof responseData.token_type !== 'string'
    ) {
      return false;
    }

    if (
      'expires_in' in responseData &&
      (responseData.expires_in == undefined ||
        typeof responseData.expires_in !== 'number')
    ) {
      return false;
    }

    if (
      'refresh_token' in responseData &&
      (responseData.refresh_token == undefined ||
        typeof responseData.refresh_token !== 'string')
    ) {
      return false;
    }

    if (
      'scope' in responseData &&
      (responseData.scope == undefined ||
        typeof responseData.scope !== 'string')
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
