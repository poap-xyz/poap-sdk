import { PaginationInput } from '../../utils';

export type ListCollectionsInput = PaginationInput & {
  ids?: number[];
};
