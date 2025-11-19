import { DropApiProvider } from '../../ports/DropApiProvider/DropApiProvider.js';
import { DropResponse } from '../../ports/DropApiProvider/types/DropResponse.js';
import {
  CreateDropInput,
  UpdateDropInput,
} from '../../ports/DropApiProvider/types/DropInput.js';

const DEFAULT_DROP_BASE_URL = 'https://api.poap.tech';

/**
 * A class that implements the `DropApiProvider` interface for interacting with the POAP Drop API.
 *
 * @class
 * @implements {DropApiProvider}
 */
export class PoapDropApi implements DropApiProvider {
  private apiKey: string;
  private baseUrl: string;

  /**
   * Creates a new instance of the `PoapDropApi` class.
   *
   * @constructor
   * @param {PoapDropApiConfig} config - Configuration object containing the API key and optional base URL.
   */
  constructor(config: PoapDropApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_DROP_BASE_URL;
  }

  /**
   * Creates a new drop via the POAP Drop API.
   *
   * @async
   * @function
   * @name PoapDropApi#createDrop
   * @param {CreateDropInput} input - The input data for creating the drop.
   * @returns {Promise<DropResponse>} A Promise that resolves with the response from the API.
   */
  async createDrop(input: CreateDropInput): Promise<DropResponse> {
    const form = new FormData();
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        if (key === 'image') {
          form.append(key, input[key]);
        } else {
          form.append(key, (input[key] as string) + '');
        }
      }
    }
    return await this.secureFetch<DropResponse>(`${this.baseUrl}/events`, {
      method: 'POST',
      body: form,
      headers: {},
    });
  }

  /**
   * Updates an existing drop via the POAP Drop API.
   *
   * @async
   * @function
   * @name PoapDropApi#updateDrop
   * @param {UpdateDropInput} input - The input data for updating the drop.
   * @returns {Promise<DropResponse>} A Promise that resolves with the response from the API.
   */
  async updateDrop(input: UpdateDropInput): Promise<DropResponse> {
    return await this.secureFetch<DropResponse>(`${this.baseUrl}/events`, {
      method: 'PUT',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Sends a secure HTTP request to the POAP Drop API.
   *
   * @async
   * @private
   * @function
   * @name PoapDropApi#secureFetch
   * @param {string} url - The URL for the HTTP request.
   * @param {RequestInit} options - The options for the HTTP request.
   * @returns {Promise<R>} A Promise that resolves with the response from the API.
   */
  private async secureFetch<R>(url: string, options: RequestInit): Promise<R> {
    const headersWithApiKey = {
      ...options.headers,
      'x-api-key': this.apiKey,
    };

    const response = await fetch(url, {
      method: options.method,
      body: options.body,
      headers: headersWithApiKey,
    });

    return await response.json();
  }
}

/**
 * Configuration interface for the PoapDropApi class.
 *
 * @interface
 * @property {string} apiKey - The API key to use for requests.
 * @property {string} [baseUrl] - Optional base URL to override the default one.
 */
export interface PoapDropApiConfig {
  apiKey: string;
  baseUrl?: string;
}
