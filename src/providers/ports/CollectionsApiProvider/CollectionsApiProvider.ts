import { UpdateCollectionInput } from './types/UpdateCollectionInput.js';
import { CreateCollectionInput } from './types/CreateCollectionInput.js';
import { CollectionResponse } from './types/CollectionResponse.js';

export interface CollectionsApiProvider {
  /**
   * Creates a new collection to the API.
   *
   * @param {CreateCollectionInput} createCollectionInput - The data for the collection to be created.
   * @param {string} accessToken - The access token used for authorization in the API request.
   * @returns {Promise<CollectionResponse>} A promise that resolves with the response data
   * of the newly created collection.
   */
  createCollection(
    createCollectionInput: CreateCollectionInput,
    accessToken: string,
  ): Promise<CollectionResponse>;

  /**
   * Applies an update to an existing collection in the POAP Collections API.
   *
   * @public
   * @async
   * @param {UpdateCollectionInput} updateCollectionInput - The new collection data to be updated.
   * @param {string} accessToken - The access token for authorization.
   * @returns {Promise<CollectionResponse>} A promise that resolves with the updated collection response from the API.
   */
  updateCollection(
    updateCollectionInput: UpdateCollectionInput,
    accessToken: string,
  ): Promise<CollectionResponse>;
}
