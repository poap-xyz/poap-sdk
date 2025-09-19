import { InvalidMediaError } from '../../ports/MomentsApiProvider/errors/InvalidMediaError';
import { CreateMomentResponse } from '../../ports/MomentsApiProvider/types/CreateMomentResponse';
import { CreateMomentInput } from '../../ports/MomentsApiProvider/types/CreateMomentInput';
import { MomentsApiProvider } from '../../ports/MomentsApiProvider/MomentsApiProvider';
import { AuthenticationProvider } from '../../ports/AuthenticationProvider/AuthenticationProvider';
import { MediaStatus } from '../../ports/MomentsApiProvider/types/MediaStatus';

const DEFAULT_MOMENTS_BASE_URL = 'https://moments.poap.tech';

/**
 * PoapMomentsApi class provides methods to interact with the POAP Moments API
 * @class
 */
export class PoapMomentsApi implements MomentsApiProvider {
  private readonly baseUrl: string;
  private readonly authenticationProvider?: AuthenticationProvider;

  /**
   * @constructor
   * @param {Object} params - Object containing constructor parameters.
   * @param {string} [params.baseUrl='https://moments.poap.xyz'] - The base URL for the POAP Moments API.
   * @param {AuthenticationProvider} [params.authenticationProvider] - Optional authentication provider only used for write operations.
   */
  constructor(params: {
    baseUrl?: string;
    authenticationProvider?: AuthenticationProvider;
  }) {
    this.baseUrl = params.baseUrl ?? DEFAULT_MOMENTS_BASE_URL;
    this.authenticationProvider = params.authenticationProvider;
  }

  /**
   * Fetch a signed URL for uploading a file
   * @returns {Promise<{ url: string; key: string }>} - A Promise that resolves to an object containing the signed URL and the media key
   */
  public async getSignedUrl(): Promise<{ url: string; key: string }> {
    const response = await fetch(`${this.baseUrl}/moments/media-upload-url`, {
      method: 'POST',
      headers: {
        Authorization: await this.getAuthorizationToken(),
      },
    });
    return await response.json();
  }

  /**
   * Upload a file using the signed URL
   * @param {Uint8Array} fileBinary - The file to be uploaded as a binary array
   * @param {string} fileType - The file type
   * @param {string} signedUrl - The signed URL for uploading the file
   * @returns {Promise<void>} - A Promise that resolves when the file has been uploaded
   */
  public async uploadFile(
    fileBinary: Uint8Array,
    signedUrl: string,
    fileType: string,
  ): Promise<void> {
    await fetch(signedUrl, {
      // @ts-expect-error: Uint8Array isn't assignable to BodyInit in some TS lib defs, but works at runtime
      body: fileBinary,
      method: 'PUT',
      headers: { 'Content-Type': fileType },
    });
  }

  /**
   * Fetches the media processing status.
   * @param {string} mediaKey - The key for the media file
   * @returns {Promise<MediaStatus>} - A Promise that resolves with the media processing status
   */
  public async fetchMediaStatus(mediaKey: string): Promise<MediaStatus> {
    const response = await fetch(`${this.baseUrl}/media/${mediaKey}`);
    if (response.status === 404) {
      return MediaStatus.IN_PROCESS;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch media status');
    }
    const data = await response.json();
    return data.status;
  }

  /**
   * Waits for the media to finish processing, checking its status at regular intervals.
   * If the media processing status is not MediaStatus.PROCESSED after a maximum number of tries,
   * an error is thrown. If the media status is MediaStatus.INVALID, an InvalidMediaFileError is thrown.
   *
   * @param mediaKey - The key for the media file
   * @param timeOut - The amount of time to wait until media is processed
   * @returns {Promise<void>} - A Promise that resolves when the media processing is complete
   */
  public async waitForMediaProcessing(
    mediaKey: string,
    timeOut = 60000,
  ): Promise<void> {
    const delay = 2000;
    const maxTries = timeOut / delay;

    const checkStatus = async (tries: number): Promise<void> => {
      if (tries >= maxTries) {
        throw new Error(
          'Exceeded maximum number of tries to check media processing status.',
        );
      }
      const status = await this.fetchMediaStatus(mediaKey);

      if (status === MediaStatus.PROCESSED) {
        return;
      }

      if (status === MediaStatus.INVALID) {
        throw new InvalidMediaError('status is invalid');
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      return checkStatus(tries + 1);
    };

    await new Promise((resolve) => setTimeout(resolve, delay));
    return checkStatus(0);
  }

  /**
   * Create a moment using the provided input
   * @param {CreateMomentInput} input - The input for creating a moment
   * @returns {Promise<CreateMomentResponse>} - A Promise that resolves to the created moment
   */
  public async createMoment(
    input: CreateMomentInput,
  ): Promise<CreateMomentResponse> {
    const response = await fetch(`${this.baseUrl}/moments`, {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
        Authorization: await this.getAuthorizationToken(),
      },
    });

    if (response.status === 409) {
      /**
       * 409 Conflict error is thrown when:
       *  - Some Media file was not found
       *  - Some Media file was not processed
       *  - Some Media is on an invalid status
       *  - Some Media is already attached to a Moment
       */
      const data = await response.json();
      throw new InvalidMediaError(data.message);
    }

    return await response.json();
  }

  private async getAuthorizationToken(): Promise<string> {
    if (!this.authenticationProvider) {
      throw new Error(
        'An AuthenticationProvider is required for write operations',
      );
    }

    const authToken = await this.authenticationProvider.getAuthToken(
      this.baseUrl,
    );

    return `Bearer ${authToken.accessToken}`;
  }
}
