import { createField } from './field.js';
import {
  EqFilter,
  FieldFilter,
  GtFilter,
  GteFilter,
  InFilter,
  LikeFilter,
  LtFilter,
  LteFilter,
  NeqFilter,
  NinFilter,
  IsNullFilter,
  Value,
} from '../types/filter.js';
import { ZERO_ADDRESS, DEAD_ADDRESS } from '../constants/index.js';
import { isFilterValueDefined } from '../validation/isFilterValueDefined.js';

export function createLikeFilter(
  key: string,
  value?: string,
): FieldFilter<LikeFilter<string>> {
  return isFilterValueDefined(value)
    ? createField<LikeFilter<string>>(key, { _ilike: `%${value}%` })
    : {};
}

export function createEqFilter<V = Value>(
  key: string,
  value?: V,
): FieldFilter<EqFilter<V>> {
  return isFilterValueDefined(value)
    ? createField<EqFilter<V>>(key, { _eq: value })
    : {};
}

export function createNeqFilter<V = Value>(
  key: string,
  value?: V,
): FieldFilter<NeqFilter<V>> {
  return isFilterValueDefined(value)
    ? createField<NeqFilter<V>>(key, { _neq: value })
    : {};
}

export function createAddressFilter(
  key: string,
  value?: string,
): FieldFilter<EqFilter<string>> {
  return isFilterValueDefined(value)
    ? createField<EqFilter<string>>(key, { _eq: value.toLowerCase() })
    : {};
}

export function createNotNullAddressFilter(
  key: string,
  filterZeroAddress?: boolean,
  filterDeadAddress?: boolean,
): FieldFilter<NeqFilter<string>> | FieldFilter<NinFilter<string>> {
  const filteredAddresses: string[] = [];
  if (filterZeroAddress !== false) {
    filteredAddresses.push(ZERO_ADDRESS);
  }
  if (filterDeadAddress !== false) {
    filteredAddresses.push(DEAD_ADDRESS);
  }
  if (filteredAddresses.length === 0) {
    return {};
  }
  if (filteredAddresses.length === 1) {
    return createField<NeqFilter<string>>(key, { _neq: filteredAddresses[0] });
  }
  return createField<NinFilter<string>>(key, { _nin: filteredAddresses });
}

export function createInFilter<V = Value>(
  key: string,
  values?: Array<V>,
): FieldFilter<InFilter<V>> {
  return isFilterValueDefined(values)
    ? createField<InFilter<V>>(key, { _in: values })
    : {};
}

export function createNinFilter<V = Value>(
  key: string,
  values?: Array<V>,
): FieldFilter<NinFilter<V>> {
  return isFilterValueDefined(values)
    ? createField<NinFilter<V>>(key, { _nin: values })
    : {};
}

export function createLtFilter<V = Value>(
  key: string,
  value?: V,
): FieldFilter<LtFilter<V>> {
  return isFilterValueDefined(value)
    ? createField<LtFilter<V>>(key, { _lt: value })
    : {};
}

export function createLteFilter<V = Value>(
  key: string,
  value?: V,
): FieldFilter<LteFilter<V>> {
  return isFilterValueDefined(value)
    ? createField<LteFilter<V>>(key, { _lte: value })
    : {};
}

export function createGtFilter<V = Value>(
  key: string,
  value?: V,
): FieldFilter<GtFilter<V>> {
  return isFilterValueDefined(value)
    ? createField<GtFilter<V>>(key, { _gt: value })
    : {};
}

export function createGteFilter<V = Value>(
  key: string,
  value?: V,
): FieldFilter<GteFilter<V>> {
  return isFilterValueDefined(value)
    ? createField<GteFilter<V>>(key, { _gte: value })
    : {};
}

export function createBetweenFilter<V = Value>(
  key: string,
  from?: V,
  to?: V,
): FieldFilter<Partial<GteFilter<V>> & Partial<LteFilter<V>>> {
  const betweenFilter: Partial<GteFilter<V>> & Partial<LteFilter<V>> = {};
  const isFromDefined = isFilterValueDefined(from);
  const isToDefined = isFilterValueDefined(to);
  if (isFromDefined) {
    betweenFilter._gte = from;
  }
  if (isToDefined) {
    betweenFilter._lte = to;
  }
  return isFromDefined || isToDefined
    ? createField<Partial<GteFilter<V>> & Partial<LteFilter<V>>>(
        key,
        betweenFilter,
      )
    : {};
}

export function createIsNullFilter(
  key: string,
  value: boolean,
): FieldFilter<IsNullFilter> {
  return createField<IsNullFilter>(key, { _is_null: value });
}
