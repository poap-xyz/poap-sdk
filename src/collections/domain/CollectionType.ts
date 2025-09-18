export const CollectionTypes = {
  Collection: 'user',
  Organization: 'organization',
  Artist: 'artist',
} as const;

export type CollectionType =
  (typeof CollectionTypes)[keyof typeof CollectionTypes];
