import { CollectionResponse } from '../types/CollectionResponse.js';

export const COLLECTION_QUERY = /* GraphQL */ `
  query Collection($id: bigint!) {
    collections(offset: 0, limit: 1, where: { id: { _eq: $id } }) {
      id
      title
      slug
      type
      year
      description
      created_by
      logo_image_url
      banner_image_url
      owner_address
      created_on
      updated_on
      collections_items_aggregate {
        aggregate {
          count
        }
      }
      urls {
        url
      }
      artist {
        slug
      }
      organization {
        slug
      }
    }
  }
`;

export type CollectionQueryResponse = {
  collections: [] | [CollectionResponse];
};

export type CollectionQueryVariables = { id: number };
