import { CompassProvider } from '../../ports/CompassProvider/CompassProvider';

const DEFAULT_COMPASS_BASE_URL = 'https://public.compass.poap.tech/v1/graphql';

/**
 * A class that implements the `CompassProvider` interface for fetching data from the POAP API.
 * @class
 * @implements {CompassProvider}
 */
export class PoapCompass implements CompassProvider {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new instance of the `PoapCompass` class.
   * @constructor
   * @param {PoapCompassConfig} config - Configuration object containing the API key and optional base URL.
   */
  constructor(config: PoapCompassConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_COMPASS_BASE_URL;
  }

  /**
   * Fetches data from the POAP GraphQL API.
   *
   * @async
   * @private
   * @function
   * @name PoapCompass#fetchGraphQL
   * @param {string} query - The GraphQL query to fetch.
   * @param {Record<string, unknown>} variables - The variables to include with the query.
   * @returns {Promise<R>} A Promise that resolves with the result of the query.
   * @template R - The type of the result.
   */
  private async fetchGraphQL<R>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<R> {
    const endpoint = this.baseUrl;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables,
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
      });

      const json = await response.json();

      if (json.errors) {
        throw new Error(
          `Error fetching GraphQL data: ${JSON.stringify(json.errors)}`,
        );
      }

      return json;
    } catch (error) {
      throw new Error(`Network error, received status code ${error}`);
    }
  }

  /**
   * Executes a GraphQL query using the `fetchGraphQL` method.
   *
   * @async
   * @function
   * @name PoapCompass#request
   * @param {string} query - The GraphQL query to execute.
   * @param {Record<string, unknown>} [variables] - The variables to include with the query.
   * @returns {Promise<T>} A Promise that resolves with the result of the query.
   * @template T - The type of the result.
   */
  async request<T>(
    query: string,
    variables: Record<string, unknown>,
  ): Promise<T> {
    return await this.fetchGraphQL<T>(query, variables ?? {});
  }
}

/**
 * Configuration interface for the PoapCompass class.
 * @interface
 * @property {string} apiKey - The API key to use for requests to the POAP API.
 * @property {string} [baseUrl] - Optional base URL for the POAP API. If not provided, a default will be used.
 */
export interface PoapCompassConfig {
  apiKey: string;
  baseUrl?: string;
}
