import { CollectionResponse } from '../types/CollectionResponse.js';
import { OrderByVariables, PaginatedVariables } from '../../utils/index.js';

export const SEARCH_COLLECTIONS_QUERY = /* GraphQL */ `
  query SearchCollections(
    $offset: Int!
    $limit: Int!
    $orderBy: [collections_order_by!]
    $where: collections_bool_exp
    $query: String!
  ) {
    search_collections(
      offset: $offset
      limit: $limit
      order_by: $orderBy
      where: $where
      args: { search: $query }
    ) {
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

export type SearchCollectionsResponse = {
  search_collections: CollectionResponse[];
};

export type SearchCollectionsVariables = PaginatedVariables &
  OrderByVariables & { query: string };
