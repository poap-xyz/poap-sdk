import { SectionResponse } from './SectionResponse.js';

/**
 * Represents the response structure for a collection entity.
 */
export interface CollectionResponse {
  /** Unique identifier for the collection. */
  id: number;

  /** SEO-friendly URL segment for the collection. */
  slug: string;

  /** User or entity that created the collection. */
  createdBy: string;

  /** Title of the collection. */
  title: string;

  /** Detailed description of the collection. Can be nullable. */
  description: string | null;

  /** URL to the banner image of the collection. Can be nullable. */
  bannerImageUrl: string | null;

  /** URL to the logo image of the collection. Can be nullable. */
  logoImageUrl: string | null;

  /** Date and time when the collection was created. */
  createdOn: Date;

  /** Date and time when the collection was last updated. */
  updatedOn: Date;

  /** Year associated with the collection. Can be nullable. */
  year: number | null;

  /** Ethereum address of the collection's owner. Must be a valid address. */
  ownerAddress: string;

  /** List of sections within the collection. */
  sections: SectionResponse[];
}
