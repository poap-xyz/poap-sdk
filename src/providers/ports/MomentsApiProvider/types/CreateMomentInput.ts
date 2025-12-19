/** Object describing the input required to create a Moment */
export interface CreateMomentInput {
  /** The IDs of the Drops to associate with the Moment */
  dropIds?: number[];
  /** The author of the Moment. An Ethereum address. */
  author: string;
  /** The media keys associated with the Moment */
  mediaKeys: string[];
  /** The description of the Moment (optional) */
  description?: string;
  /**  Tags to be associated with the moment. Either the address or ens should be provided. */
  userTags?: (
    | { address: string; ens?: string }
    | { address?: string; ens: string }
  )[];
}
