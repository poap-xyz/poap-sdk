import { UserTag } from 'src/moments/client/dtos/create/UserTag.js';

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
  /**  Tags to be associated with the moment. */
  userTags?: UserTag[];
}
