import { ItemResponse } from './ItemResponse.js';

/**
 * Represents the structure for a section within a collection.
 */
export interface SectionResponse {
  /** Unique identifier for the section (typically a UUID). */
  id: string;

  /** The name of the section, which can be null only if this is the sole section in the collection. */
  name: string | null;

  /** The ordinal position of the section within the collection, starting from 0. Incremental, integer */
  position: number;

  /** Identifier of the collection to which the section belongs, must be a positive integer. */
  collectionId: number;

  /** List of item responses contained within the section, must contain at least one item. */
  items: ItemResponse[];
}
