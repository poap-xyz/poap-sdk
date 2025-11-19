import { ProfileResponse } from '../../providers/ports/ProfilesApiProvider/types/ProfileResponse.js';

export class Profile {
  constructor(
    public address: string,
    public ens: string,
    public avatar: string | null,
    public header: string | null,
    /** The UNIX timestamp of the last time the profile was cached by the API. */
    public fresh: number,
  ) {}

  public toSerializable(): SerializableProfile {
    return {
      address: this.address,
      ens: this.ens,
      avatar: this.avatar,
      header: this.header,
      fresh: this.fresh,
    };
  }

  public static fromResponse(
    response: ProfileResponse,
    apiUrl: string,
  ): Profile {
    return new Profile(
      response.address,
      response.ens,
      response.records.avatar ? `${apiUrl}/avatar/${response.ens}` : null,
      response.records.header ? `${apiUrl}/header/${response.ens}` : null,
      response.fresh,
    );
  }

  public static fromSerializable(serializable: SerializableProfile): Profile {
    return new Profile(
      serializable.address,
      serializable.ens,
      serializable.avatar,
      serializable.header,
      serializable.fresh,
    );
  }
}

export type SerializableProfile = {
  address: string;
  ens: string;
  avatar: string | null;
  header: string | null;
  fresh: number;
};
