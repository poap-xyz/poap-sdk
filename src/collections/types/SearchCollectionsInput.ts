import { PaginationInput } from '../../utils';

export type SearchCollectionsInput = PaginationInput & {
  query: string;
};
