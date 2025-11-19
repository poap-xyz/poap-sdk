import { Order, PaginatedVariables } from '../../utils/index.js';
import { DropResponse } from '../types/DropResponse.js';

export const SEARCH_DROPS_QUERY = `
  query SearchDrops(
    $limit: Int!
    $offset: Int!
    $args: search_drops_args!
    $orderBy: [drops_order_by!]
  ) {
    search_drops(
      limit: $limit
      offset: $offset
      args: $args
      order_by: $orderBy
    ) {
      id
      fancy_id
      name
      description
      city
      country
      channel
      platform
      location_type
      drop_url
      image_url
      animation_url
      year
      start_date
      timezone
      private
      created_date
      expiry_date
      end_date
      stats_by_chain_aggregate {
        aggregate {
          sum {
            transfer_count
            poap_count
          }
        }
      }
      email_claims_stats {
        reserved
      }
      drop_image {
        gateways {
          type
          url
        }
      }
    }
  }
`;

export interface SearchDropsResponse {
  search_drops: DropResponse[];
}

export interface SearchDropsVariables extends PaginatedVariables {
  args: {
    search: string;
  };
  orderBy?: { id: Order.ASC };
}
