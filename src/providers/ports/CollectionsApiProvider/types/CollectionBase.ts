import { CreateOrUpdateSection } from './CreateOrUpdateSection.js';

/**
 * Base interface for collection properties shared across creation and updating processes.
 */
export interface CollectionBase {
  /** Title of the collection. */
  title: string;

  /** Identifier of the user or entity responsible for the collection. Can be any string you want, for example: POAP */
  createdBy: string;

  /** Detailed description of the collection. Can be nullable. */
  description: string | null;

  /** URL to the banner image of the collection. Can be nullable. */
  bannerImageUrl: string | null;

  /** URL to the logo image of the collection. Can be nullable. */
  logoImageUrl: string | null;

  /** Year associated with the collection. Can be nullable. */
  year: number | null;

  /** Array of sections to be included in or updated within the collection. */
  sections: CreateOrUpdateSection[];
}
