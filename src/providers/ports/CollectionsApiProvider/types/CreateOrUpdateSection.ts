import { CreateOrUpdateItem } from './CreateOrUpdateItem.js';

/**
 * Describes the structure for creating or updating a section within a collection.
 */
export interface CreateOrUpdateSection {
  /** Unique identifier for the section, which may be null for new sections. */
  id: string | null;

  /** The name of the section; nullable only if this is the sole section in the collection. */
  name: string | null;

  /** The ordinal position of the section within the collection, starting from 0. Incremental, integer */
  position: number;

  /** List of items contained within the section, must contain at least 1 and no more than 300 items. */
  items: CreateOrUpdateItem[];
}
