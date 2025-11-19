import { PaginationInput } from '../../utils/index.js';

export interface SearchDropsInput extends PaginationInput {
  search: string;
}
