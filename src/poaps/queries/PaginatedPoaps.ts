import {
  FilterVariables,
  OrderByVariables,
  PaginatedVariables,
} from '../../utils';

export const PAGINATED_POAPS_QUERY = /* GraphQL */ `
  query PaginatedPoaps(
    $limit: Int!
    $offset: Int!
    $orderBy: [poaps_order_by!]
    $where: poaps_bool_exp
  ) {
    poaps(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
      chain
      collector_address
      drop_id
      id
      minted_on
      transfer_count
      drop {
        image_url
        city
        country
        description
        start_date
        end_date
        name
      }
    }
  }
`;

export function buildPaginatedPoapsQuery({
  withMintingStats,
  withCollectorStats,
  withDropStats,
}: {
  withMintingStats: boolean;
  withCollectorStats: boolean;
  withDropStats: boolean;
}): string {
  return /* GraphQL */ `
    query PaginatedPoapsWithStats(
      $limit: Int!
      $offset: Int!
      $orderBy: [poaps_order_by!]
      $where: poaps_bool_exp
    ) {
      poaps(limit: $limit, offset: $offset, order_by: $orderBy, where: $where) {
        chain
        collector_address
        drop_id
        id
        minted_on
        transfer_count
        drop {
          image_url
          city
          country
          description
          start_date
          end_date
          timezone
          name
        }
        ${withMintingStats ? 'minting_stats { mint_order }' : ''}
        ${withCollectorStats ? 'collector { poaps_owned }' : ''}
        ${withDropStats ? `drop_stats_by_chain_aggregate { aggregate { sum { poap_count } } }` : ''}
      }
    }
  `;
}

export interface PoapsResponse {
  id: number;
  collector_address: string;
  transfer_count: number;
  minted_on: number;
  drop_id: number;
  drop: {
    image_url: string;
    city: string;
    country: string;
    description: string;
    start_date: string;
    end_date: string;
    name: string;
  };
}

export interface PaginatedPoapsResponse {
  poaps: PoapsResponse[];
}

export interface PoapsWithStatsResponse extends PoapsResponse {
  minting_stats?: { mint_order?: number };
  collector?: { poaps_owned?: number };
  drop_stats_by_chain_aggregate?: {
    aggregate: { sum: { poap_count: number } };
  };
}

export interface PaginatedPoapsWithStatsesponse {
  poaps: PoapsWithStatsResponse[];
}

export type PaginatedPoapsVariables = FilterVariables &
  OrderByVariables &
  PaginatedVariables;

export const POAPS_COUNT_QUERY = /* GraphQL */ `
  query PoapsCount($where: poaps_bool_exp) {
    poaps_aggregate(where: $where) {
      aggregate {
        count
      }
    }
  }
`;

export interface PoapsCountResponse {
  poaps_aggregate: { aggregate: { count: number } };
}

export type PoapsCountVariables = FilterVariables;
