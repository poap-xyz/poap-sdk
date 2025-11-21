import chunk from 'lodash.chunk';
import { CompassProvider } from '../../ports/CompassProvider/CompassProvider.js';
import { CompassErrors } from '../../ports/CompassProvider/types/CompassErrors.js';
import { CompassError } from '../../ports/CompassProvider/types/CompassError.js';
import { CompassRequestError } from '../../ports/CompassProvider/errors/CompassRequestError.js';
import { CompassMissingDataError } from '../../ports/CompassProvider/errors/CompassMissingDataError.js';
import { CompassBadRequestError } from '../../ports/CompassProvider/errors/CompassBadRequestError.js';
import { CompassUnauthorizedError } from '../../ports/CompassProvider/errors/CompassUnauthorizedError.js';

const DEFAULT_COMPASS_BASE_URL = 'https://public.compass.poap.tech/v1/graphql';

/**
 * A class that implements the `CompassProvider` interface for fetching data from the POAP API.
 * @class
 * @implements {CompassProvider}
 */
export class PoapCompass implements CompassProvider {
  /**
   * Maximum number of request to do at the time in a batch.
   */
  protected batchSize = 5;

  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new instance of the `PoapCompass` class.
   * @constructor
   * @param {PoapCompassConfig} config - Configuration object containing the API key and optional base URL.
   */
  constructor(config: PoapCompassConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_COMPASS_BASE_URL;
  }

  /**
   * Fetches data from the POAP GraphQL API.
   *
   * @async
   * @private
   * @function
   * @name PoapCompass#fetchGraphQL
   * @param {string} query - The GraphQL query to fetch.
   * @param {{ readonly [variable: string]: unknown }} variables - The variables to include with the query.
   * @param {RequestInit} options - Additional options to pass to the fetch call.
   * @returns {Promise<R>} A Promise that resolves with the result of the query.
   * @template R - The type of the result.
   */
  private async fetchGraphQL<R>(
    query: string,
    variables: { readonly [variable: string]: unknown },
    options?: RequestInit,
  ): Promise<R> {
    let response: Response;

    const headers: HeadersInit = {
      ...options?.headers,
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };

    try {
      response = await fetch(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables,
        }),
        ...options,
        headers,
      });
    } catch (error: unknown) {
      throw new Error(`Network error, received error ${error}`);
    }

    this.handleResponseStatus(response);

    const body = await response.json();

    this.handleResponseErrors(body);

    return body;
  }

  /**
   * Handles HTTP status codes and throws corresponding errors.
   *
   * @private
   * @function
   * @name PoapCompass#handleHttpStatus
   * @param {Response} response - The response from the fetch call.
   * @throws {CompassUnauthorizedError} for 401 Unauthorized status codes.
   * @throws {CompassBadRequestError} for 400 Bad Request status codes.
   * @throws {Error} for other non-200 status codes.
   */
  private handleResponseStatus(response: Response): void {
    switch (response.status) {
      case 400:
        throw new CompassBadRequestError();
      case 401:
        throw new CompassUnauthorizedError();
      case 200:
        return; // OK
      default:
        // For simplicity, throwing a generic error for all other statuses.
        // You can add more cases for other statuses as needed.
        throw new Error(
          `Response error, received status code ${response.status}`,
        );
    }
  }

  /**
   * Throws error when the response contains error or does not contain any data.
   *
   * @private
   * @function
   * @name PoapCompass#handleResponseErrors
   * @param {unknown} response - Some response from the GraphQL server.
   * @throws {CompassRequestError} when the response contains errors.
   * @throws {CompassMissingDataError} when the response doesn't contain any data.
   */
  private handleResponseErrors(response: unknown): void {
    if (this.isError(response)) {
      throw new CompassRequestError(response);
    }

    if (!this.hasData(response)) {
      throw new CompassMissingDataError();
    }
  }

  /**
   * Returns true when the given response is a GraphQL error response.
   *
   * @private
   * @function
   * @name PoapCompass#isError
   * @param {unknown} response - Some response from the GraphQL server.
   * @returns {boolean}
   */
  private isError(response: unknown): response is CompassErrors {
    return (
      response != null &&
      typeof response === 'object' &&
      'errors' in response &&
      Array.isArray(response.errors) &&
      response.errors.every(
        (error: unknown): error is CompassError =>
          error != null &&
          typeof error === 'object' &&
          'message' in error &&
          typeof error.message === 'string',
      )
    );
  }

  /**
   * Returns true when the given response is a GraphQL data response.
   *
   * @private
   * @function
   * @name PoapCompass#hasData
   * @param {unknown} response - Some response from the GraphQL server.
   * @returns {boolean}
   */
  private hasData(response: unknown): response is { data: unknown } {
    return (
      response != null &&
      typeof response === 'object' &&
      'data' in response &&
      response.data != null &&
      typeof response.data === 'object'
    );
  }

  async request<D, V = { readonly [variable: string]: unknown }>(
    query: string,
    variables?: null | undefined | V,
    options?: RequestInit,
  ): Promise<{ data: D }> {
    return await this.fetchGraphQL<{ data: D }>(
      query,
      variables ?? {},
      options,
    );
  }

  async batch<D, V = { readonly [variable: string]: unknown }>(
    query: string,
    variables: V[],
    options?: RequestInit,
  ): Promise<{ data: D }[]> {
    const results: { data: D }[] = [];
    const chunks: V[][] = chunk(variables, this.batchSize);

    for (const chunk of chunks) {
      const responses = await Promise.all(
        chunk.map((variables) => this.request<D, V>(query, variables, options)),
      );
      results.push(...responses);
    }

    return results;
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
