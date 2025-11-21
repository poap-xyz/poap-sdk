import { UpdateCollectionInput } from '../../ports/CollectionsApiProvider/types/UpdateCollectionInput.js';
import { CreateCollectionInput } from '../../ports/CollectionsApiProvider/types/CreateCollectionInput.js';
import { CollectionsUnauthorizedError } from '../../ports/CollectionsApiProvider/errors/CollectionsUnauthorizedError.js';
import { CollectionsBadRequestError } from '../../ports/CollectionsApiProvider/errors/CollectionsBadRequestError.js';
import { CollectionResponse } from '../../ports/CollectionsApiProvider/types/CollectionResponse.js';
import { CollectionsApiProvider } from '../../ports/CollectionsApiProvider/CollectionsApiProvider.js';

const DEFAULT_COLLECTIONS_BASE_URL = 'https://collections.poap.tech';
/**
 * @class PoapCollectionsApi
 * @implements {CollectionsApiProvider}
 */
export class PoapCollectionsApi implements CollectionsApiProvider {
  private baseUrl: string;

  /**
   * Creates an instance of PoapCollectionsApi.
   *
   * @constructor
   * @param {string} [baseUrl='https://collections.poap.tech'] - The base URL for the Collections API.
   * If not provided, a default URL is used.
   */
  constructor({ baseUrl }: PoapCollectionsApiConfig) {
    this.baseUrl = baseUrl || DEFAULT_COLLECTIONS_BASE_URL;
  }

  /**
   * Create a new collection to the POAP Collections API.
   *
   * @public
   * @async
   * @param {CreateCollectionInput} createCollectionInput - The collection data to be posted.
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<CollectionResponse>} A promise that resolves with the collection response from the API.
   */
  public async createCollection(
    createCollectionInput: CreateCollectionInput,
    accessToken: string,
  ): Promise<CollectionResponse> {
    return await this.secureFetch<CollectionResponse>(
      `${this.baseUrl}/collections`,
      {
        method: 'POST',
        body: JSON.stringify(createCollectionInput),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      accessToken,
    );
  }

  /**
   * Applies an update to an existing collection in the POAP Collections API.
   *
   * @public
   * @async
   * @param {UpdateCollectionInput} updateCollectionInput - The new collection data to be updated.
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<CollectionResponse>} A promise that resolves with the updated collection response from the API.
   */
  public async updateCollection(
    updateCollectionInput: UpdateCollectionInput,
    accessToken: string,
  ): Promise<CollectionResponse> {
    return await this.secureFetch<CollectionResponse>(
      `${this.baseUrl}/collections/${updateCollectionInput.collectionId}`,
      {
        method: 'PUT',
        body: JSON.stringify(updateCollectionInput),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      accessToken,
    );
  }

  /**
   * Sends a secure HTTP request to the POAP Collections API.
   *
   * This method is used internally by `createCollection` and `patchCollection` to send HTTP requests.
   *
   * @private
   * @async
   * @param {string} url - The URL for the HTTP request.
   * @param {RequestInit} options - The options for the HTTP request, including method and body.
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<R>} A promise that resolves with the response from the API.
   */
  private async secureFetch<R>(
    url: string,
    options: RequestInit,
    accessToken: string,
  ): Promise<R> {
    const headersWithApiKey = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await fetch(url, {
      method: options.method,
      body: options.body,
      headers: headersWithApiKey,
    });

    this.handleResponseStatus(response);

    return await response.json();
  }

  /**
   * Handles HTTP status codes and throws corresponding errors.
   *
   * @private
   * @function
   * @name PPoapCollectionsApi#handleHttpStatus
   * @param {Response} response - The response from the fetch call.
   * @throws {CollectionsUnauthorizedError} for 401 Unauthorized status codes.
   * @throws {CollectionsBadRequestError} for 400 Bad Request status codes.
   * @throws {Error} for other non-200 status codes.
   */
  private handleResponseStatus(response: Response): void {
    switch (response.status) {
      case 400:
        throw new CollectionsBadRequestError();
      case 401:
        throw new CollectionsUnauthorizedError();
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
}

/**
 * Configuration interface for the PoapCollectionsApi class.
 * @interface
 * @property {string} [baseUrl] - Optional base URL for the POAP Collections API. If not provided, a default will be used.
 */
export interface PoapCollectionsApiConfig {
  baseUrl?: string;
}
