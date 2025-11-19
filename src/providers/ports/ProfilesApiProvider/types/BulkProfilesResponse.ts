import { ProfilesBulkError } from './ProfilesBulkError.js';
import { ProfileResponse } from './ProfileResponse.js';

export interface BulkProfilesResponse {
  profiles: ProfileResponse[];
  errors?: ProfilesBulkError[];
}
