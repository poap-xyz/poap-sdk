import {
  FilterVariables,
  OrderByVariables,
  PaginatedVariables,
} from '../../utils/index.js';

export const PAGINATED_MOMENTS_QUERY = /* GraphQL */ `
  query PaginatedMoments(
    $limit: Int!
    $offset: Int!
    $orderBy: [moments_order_by!]
    $where: moments_bool_exp
  ) {
    moments(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
      author
      created_on
      drops {
        drop_id
      }
      id
      description
    }
  }
`;

export interface MomentResponse {
  author: string;
  created_on: string;
  drops: { drop_id: number }[];
  id: string;
  description: string | null;
}

export interface MomentsQueryResponse {
  moments: MomentResponse[];
}

export type MomentsQueryVariables = FilterVariables &
  OrderByVariables &
  PaginatedVariables;
