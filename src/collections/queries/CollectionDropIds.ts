export const COLLECTION_DROP_IDS_QUERY = /* GraphQL */ `
  query CollectionDropIds($id: bigint!) {
    collections_collection_drop_ids(where: { collection_id: { _eq: $id } }) {
      drop_ids
    }
  }
`;

export type CollectionDropIdsResponse = {
  collections_collection_drop_ids: Array<{ drop_ids: number[] }>;
};

export type CollectionDropIdsVariables = { id: number };
