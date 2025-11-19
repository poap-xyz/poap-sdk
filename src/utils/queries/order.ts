import { createField } from './field.js';
import { Order, FieldOrderBy } from '../types/order.js';

export function createOrderBy<E extends string = string>(
  key: E | undefined,
  value?: Order,
): FieldOrderBy {
  return key && value ? createField<Order>(key, value) : {};
}
