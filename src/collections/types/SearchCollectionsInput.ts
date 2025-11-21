import { PaginationInput } from '../../utils/index.js';

export type SearchCollectionsInput = PaginationInput & {
  query: string;
};
