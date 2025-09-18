import { CollectionResponse } from '../types/CollectionResponse';
import {
  FilterVariables,
  OrderByVariables,
  PaginatedVariables,
} from '../../utils';

export const PAGINATED_COLLECTIONS_QUERY = /* GraphQL */ `
  query PaginatedCollections(
    $offset: Int!
    $limit: Int!
    $orderBy: [collections_order_by!]
    $where: collections_bool_exp
  ) {
    collections(
      offset: $offset
      limit: $limit
      order_by: $orderBy
      where: $where
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

export type PaginatedCollectionsResponse = {
  collections: CollectionResponse[];
};

export type PaginatedCollectionsVariables = PaginatedVariables &
  FilterVariables &
  OrderByVariables;
