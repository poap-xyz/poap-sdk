import { PaginationInput } from '../../utils/index.js';

export type ListCollectionsInput = PaginationInput & {
  ids?: number[];
};
