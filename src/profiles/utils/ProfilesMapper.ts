import { Profile } from '../domain/Profile.js';
import { ProfileError } from '../domain/ProfileError.js';
import {
  ProfileResponse,
  ProfilesBulkError,
} from '../../providers/ports/ProfilesApiProvider/types/index.js';

export class ProfilesMapper {
  static createProfilesMap(
    profiles: ProfileResponse[],
    apiUrl: string,
  ): Map<string, Profile> {
    const profilesMap = new Map<string, Profile>();
    const processedAddresses = new Set<string>();

    for (const response of profiles) {
      if (processedAddresses.has(response.address)) {
        continue;
      }
      this.addProfileToMap(response, profilesMap, apiUrl);
      processedAddresses.add(response.address);
    }

    return profilesMap;
  }

  private static addProfileToMap(
    response: ProfileResponse,
    profilesMap: Map<string, Profile>,
    apiUrl: string,
  ): void {
    const profile = Profile.fromResponse(response, apiUrl);
    profilesMap.set(profile.address, profile);
    if (profile.ens) {
      profilesMap.set(profile.ens, profile);
    }
  }

  static createErrorsMap(
    errors: ProfilesBulkError[],
  ): Map<string, ProfileError> {
    const errorsMap = new Map<string, ProfileError>();
    for (const error of errors) {
      errorsMap.set(error.id, { message: error.message });
    }
    return errorsMap;
  }
}
