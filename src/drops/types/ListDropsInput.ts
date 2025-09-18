import { Order, PaginationInput } from '../../utils';
import { DropsSortFields } from './DropsSortFields';

export type ListDropsInput = PaginationInput & {
  sortField?: DropsSortFields;
  sortDir?: Order;
  /** Drop event date range to happen from or after the given date. */
  from?: string;
  /** Drop event date range to happen up to or before the given date. */
  to?: string;
  /** List of drop IDs to filter the drops. */
  ids?: number[];
};
