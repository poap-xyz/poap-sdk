import { CreateSteps } from './CreateSteps.js';
import { UserTag } from './UserTag.js';

/** Interface representing the input needed to create a moment. */
export interface CreateMomentInput {
  /** The author of the moment. An Ethereum address. */
  author: string;
  /** The description of the moment. */
  description?: string;
  /** The IDs of the drops to associate to the moment. */
  dropIds?: number[];
  /** The amount of time to wait until media is processed. */
  timeOut?: number;
  /** Callback function to be called when the step changes. */
  onStepUpdate?: (step: CreateSteps) => void | Promise<void>;
  /** The media keys previously uploaded to attach to the Moment. */
  mediaKeys?: string[];
  /**  Tags to be associated with the moment. */
  userTags?: UserTag[];
}
