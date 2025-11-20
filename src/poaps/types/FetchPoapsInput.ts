import { Chain, Order, PaginationInput } from '../../utils';
import { PoapsSortFields } from './PoapsSortFields';

export interface FetchPoapsInput {
  /** Optional filter for the name of a POAP. */
  name?: string;
  /** Optional filter for the blockchain chain of a POAP. */
  chain?: Chain;
  /** Optional filter for the start date when a POAP was minted. */
  mintedDateFrom?: string;
  /** Optional filter for the end date when a POAP was minted. */
  mintedDateTo?: string;
  /** Optional filter for specific POAP IDs. */
  ids?: number[];
  /** Optional filter for the collector's address. */
  collectorAddress?: string;
  /** Optional filter for a specific drop ID. */
  dropId?: number;
  /** Filter to include/exclude POAPs with zero addresses. Defaults to true. */
  filterZeroAddress?: boolean;
  /** Filter out dead addresses? Defaults to true. */
  filterDeadAddress?: boolean;
}

export interface FetchPoapsPaginatedInput
  extends FetchPoapsInput,
    PaginationInput {
  /** Field by which to sort the results. */
  sortField?: PoapsSortFields;
  /** Direction in which to sort the results. */
  sortDir?: Order;
  /** Include extra info about the token being minted. */
  withMintingStats?: boolean;
  /** Include stats about the token collector. */
  withCollectorStats?: boolean;
  /** Include the POAP drop stats. */
  withDropStats?: boolean;
}
