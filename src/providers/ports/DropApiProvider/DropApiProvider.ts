import { CreateDropInput, UpdateDropInput } from './types/DropInput.js';
import { DropResponse } from './types/DropResponse.js';

/**
 * Provides methods for interacting with a drop API.
 *
 * @interface DropApiProvider
 */
export interface DropApiProvider {
  /**
   * Creates a new drop.
   *
   * @async
   * @function
   * @name DropApiProvider#createDrop
   * @param {CreateDropInput} input - The input data for creating the drop.
   * @returns {Promise<DropResponse>} A Promise that resolves with the response from the API.
   */
  createDrop(input: CreateDropInput): Promise<DropResponse>;

  /**
   * Updates an existing drop.
   *
   * @async
   * @function
   * @name DropApiProvider#updateDrop
   * @param {UpdateDropInput} input - The input data for updating the drop.
   * @returns {Promise<DropResponse>} A Promise that resolves with the response from the API.
   */
  updateDrop(input: UpdateDropInput): Promise<DropResponse>;
}
