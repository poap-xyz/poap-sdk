import { CreateSteps } from './CreateSteps.js';
import { CreateMedia } from './CreateMedia.js';

/** Interface representing the input needed to create a moment and upload media in one action. */
export interface CreateAndUploadMomentInput {
  /** The author of the moment. An Ethereum address. */
  author: string;
  /** The description of the moment. */
  description?: string;
  /** The IDs of the drops to associate to the moment. */
  dropIds?: number[];
  /** The amount of time to wait until media is processed. */
  timeOut?: number;
  /** Callback function to be called when the progress step changes. */
  onStepUpdate?: (step: CreateSteps) => void | Promise<void>;
  /** Callback function to be called when the file upload progress change - progress is a number between 0 and 1. */
  onFileUploadProgress?: (progress: number) => void | Promise<void>;
  /** The media to be uploaded and attached to the Moment. */
  media?: CreateMedia[];
}
