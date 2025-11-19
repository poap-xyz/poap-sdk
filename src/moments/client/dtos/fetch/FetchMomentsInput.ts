import { Order, PaginationInput } from '../../../../utils/index.js';

/**
 * Interface representing the input needed to fetch moments.
 * @interface
 * @property {number} limit - The maximum number of moments to fetch.
 * @property {number} offset - The number of moments to skip before starting to fetch.
 * @property {string} [createdOrder] - The order to use for sorting by creation time (optional).
 * @property {string} [idOrder] - The order to use for sorting by moment ID (optional).
 * @property {string} [author] - The author of the moments to fetch (optional).
 * @property {string} [from] - The start date for filtering moments by creation time (optional).
 * @property {string} [to] - The end date for filtering moments by creation time (optional).
 * @property {string} [id] - The moment ID to fetch (optional).
 * @property {number[]} [dropIds] - The drop IDs to filter moments by (optional).
 */
export interface FetchMomentsInput extends PaginationInput {
  createdOrder?: Order;
  idOrder?: Order;
  author?: string;
  from?: string;
  to?: string;
  id?: string;
  dropIds?: number[];
}
