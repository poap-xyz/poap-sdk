import { CollectionResponse } from '../types/CollectionResponse.js';
import { CollectionType } from './CollectionType.js';

export class Collection {
  private static COLLECTIONS_URL_PREFIX = 'https://collections.poap.xyz';

  id: number;
  url: string;
  type: CollectionType;
  title: string;
  description: string | null;
  year: number | null;
  createdBy: string | null;
  links: string[];
  logoImageUrl: string | null;
  bannerImageUrl: string;
  ownerAddress: string | null;
  createdOn: string;
  updatedOn: string;
  dropsCount: number;

  /** When fetched individually using `CollectionsClient.get`, contains the list of all drop IDs in the collection. */
  private _dropIds: number[] | null;

  // eslint-disable-next-line max-statements
  constructor(properties: CollectionProperties, dropIds: number[] | null) {
    this.id = properties.id;
    this.url = properties.url;
    this.type = properties.type;
    this.title = properties.title;
    this.description = properties.description?.trim() || null;
    this.year = properties.year;
    this.createdBy = properties.createdBy?.trim() || null;
    this.links = properties.links;
    this.logoImageUrl = properties.logoImageUrl;
    this.bannerImageUrl = properties.bannerImageUrl;
    this.ownerAddress = properties.ownerAddress;
    this.createdOn = properties.createdOn;
    this.updatedOn = properties.updatedOn;
    this.dropsCount = properties.dropsCount;
    this._dropIds = dropIds;
  }

  /**
   * The list of drop IDs in the collection.
   * @throws Will throw an error if the collection was not fetched individually using `CollectionsClient.get`.
   * @returns An array of drop IDs.
   */
  public get dropIds(): number[] {
    if (this._dropIds === null) {
      throw new Error(
        'Drop IDs are not available. use `client.get(collectionId) to fetch the collection with drop IDs.`',
      );
    }

    return this._dropIds;
  }

  public static fromResponse(
    response: CollectionResponse,
    dropIds?: number[],
  ): Collection {
    return new Collection(
      {
        id: response.id,
        url: Collection.getCollectionUrlFromResponse(response),
        type: response.type,
        title: response.title,
        description: response.description,
        year: response.year,
        createdBy: response.created_by,
        links: response.urls.map((link) => link.url),
        logoImageUrl: response.logo_image_url,
        bannerImageUrl:
          response.banner_image_url ||
          `${Collection.COLLECTIONS_URL_PREFIX}/collections/${response.id}/banner`,
        ownerAddress: response.owner_address,
        createdOn: response.created_on,
        updatedOn: response.updated_on,
        dropsCount: response.collections_items_aggregate.aggregate.count,
      },
      dropIds || null,
    );
  }

  private static getCollectionUrlFromResponse(
    response: CollectionResponse,
  ): string {
    if (response.type === 'artist' && response.artist) {
      return `${Collection.COLLECTIONS_URL_PREFIX}/artists/${response.artist.slug}`;
    }

    if (response.type === 'organization' && response.organization) {
      return `${Collection.COLLECTIONS_URL_PREFIX}/organizations/${response.organization.slug}`;
    }

    return `${Collection.COLLECTIONS_URL_PREFIX}/collections/${response.slug}/${response.id}`;
  }
}

export type CollectionProperties = {
  id: number;
  url: string;
  type: CollectionType;
  title: string;
  description: string | null;
  year: number | null;
  createdBy: string | null;
  links: string[];
  logoImageUrl: string | null;
  bannerImageUrl: string;
  ownerAddress: string | null;
  createdOn: string;
  updatedOn: string;
  dropsCount: number;
};
