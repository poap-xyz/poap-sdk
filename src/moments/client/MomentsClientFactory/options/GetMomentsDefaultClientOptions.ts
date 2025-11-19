import { AuthenticationProvider } from '../../../../providers/index.js';

interface MomentsBaseOptions {
  /**
   * The base URL for the Moments API.
   * @default https://moments.poap.tech
   */
  momentsBaseUrl?: string;
}

/**
 * Options to create a Moments client with an authentication provider.
 */
export interface MomentsWithAuthenticationProvider extends MomentsBaseOptions {
  authenticationProvider: AuthenticationProvider;
}

/**
 * Options to create a Moments client with OAuth credentials.
 */
export interface MomentsWithOAuthCredentials extends MomentsBaseOptions {
  oAuthCredentials: {
    /**
     * The client ID for the OAuth server.
     */
    clientId: string;
    /**
     * The client secret for the OAuth server.
     */
    clientSecret: string;
    /**
     * The domain of the OAuth server.
     * @default auth.accounts.poap.xyz
     */
    oAuthServerDomain?: string;
  };
}

export interface GetMomentsDefaultClientOptions {
  /**
   * The options to create a Moments client.
   */
  moments: MomentsWithAuthenticationProvider | MomentsWithOAuthCredentials;
  /**
   * The options to create a Compass provider.
   */
  compass: {
    /**
     * The API key for the Compass provider.
     */
    compassApiKey: string;
    /**
     * The base URL for the Compass provider.
     * @default https://public.compass.poap.tech/v1/graphql
     */
    compassBaseUrl?: string;
  };
}
