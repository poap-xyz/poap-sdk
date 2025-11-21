import { Profile } from '../domain/Profile.js';
import { ProfileError } from '../domain/ProfileError.js';

export interface FetchBulkProfilesResponse {
  profiles: Map<string, Profile>;
  errors: Map<string, ProfileError>;
}
