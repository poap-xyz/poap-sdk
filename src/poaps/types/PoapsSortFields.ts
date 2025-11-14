/**
 * Enum to define available fields for sorting POAPs.
 *
 * Note: The string values use snake_case as they correspond to
 * backend API field names, while the enum keys use camelCase
 * to maintain consistency with TypeScript conventions.
 */
export enum PoapsSortFields {
  /** Represents sorting by the date when a POAP was minted. */
  MintedOn = 'minted_on',
  /** Represents sorting by the ID of a POAP. */
  Id = 'id',
}
