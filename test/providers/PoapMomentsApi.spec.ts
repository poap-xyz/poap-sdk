import { AuthenticationProvider } from '../../src/providers/ports/AuthenticationProvider/AuthenticationProvider';
import { PoapMomentsApi } from '../../src/providers/core/PoapMomentsApi/PoapMomentsApi';
import { InvalidMediaError } from '../../src/providers/ports/MomentsApiProvider/errors/InvalidMediaError';
import { mock, MockProxy } from 'jest-mock-extended';
import { MediaStatus } from '../../src/providers/ports/MomentsApiProvider/types/MediaStatus';
import { CreateMomentInput } from '../../src/providers/ports/MomentsApiProvider/types/CreateMomentInput';
import { CreateMomentResponse } from '../../src/providers/ports/MomentsApiProvider/types/CreateMomentResponse';
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';

enableFetchMocks();

describe('PoapMomentsApi', () => {
  const BASE_URL = 'https://moments.test';

  let api: PoapMomentsApi;
  let authenticationProviderMocked: MockProxy<AuthenticationProvider>;

  beforeEach(() => {
    authenticationProviderMocked = mock();
    authenticationProviderMocked.getAuthToken.mockResolvedValue({
      accessToken: 'mockAccessToken',
      tokenType: 'mockTokenType',
    });
    fetchMock.resetMocks();
    api = new PoapMomentsApi({
      baseUrl: BASE_URL,
      authenticationProvider: authenticationProviderMocked,
    });
  });

  describe('getSignedUrl', () => {
    it('should fetch a signed URL', async () => {
      const mockResponse = { url: 'mock-signed-url', key: 'mock-key' };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await api.getSignedUrl();
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when AuthenticationProvider is not provided', async () => {
      api = new PoapMomentsApi({});
      await expect(api.getSignedUrl()).rejects.toThrow();
    });
  });

  describe('uploadFile', () => {
    it('should upload a file to the signed URL', async () => {
      const file = Uint8Array.from('test-file');
      const signedUrl = 'https://mock-signed-url';
      const fileType = 'image/png';

      fetchMock.mockResponseOnce('', { status: 200 });

      await expect(
        api.uploadFile(file, signedUrl, fileType),
      ).resolves.not.toThrow();
    });
  });

  describe('fetchMediaStatus', () => {
    it('should fetch the media status', async () => {
      const mediaKey = 'mock-media-key';
      const mockResponse = { status: MediaStatus.PROCESSED };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await api.fetchMediaStatus(mediaKey);
      expect(result).toEqual(mockResponse.status);
    });
  });

  describe('waitForMediaProcessing', () => {
    it('should wait for media processing without throwing an error', async () => {
      const mediaKey = 'mock-media-key';
      const mockResponse = { status: MediaStatus.PROCESSED };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      await expect(
        api.waitForMediaProcessing(mediaKey, 5000),
      ).resolves.not.toThrow();
    });

    it('should throw InvalidMediaFileError when media status is INVALID', async () => {
      const mediaKey = 'mock-media-key';
      const invalidMediaResponse = { status: MediaStatus.INVALID };
      fetchMock.mockResponseOnce(JSON.stringify(invalidMediaResponse));

      await expect(api.waitForMediaProcessing(mediaKey, 5000)).rejects.toThrow(
        InvalidMediaError,
      );
    });
  });

  describe('createMoment', () => {
    const createMomentInput: CreateMomentInput = {
      dropIds: [1],
      author: '0x1234',
      mediaKeys: ['mock-media-key'],
      description: 'This is a test description',
    };

    it('should create a moment successfully', async () => {
      const mockResponse: CreateMomentResponse = {
        id: '1',
        author: '0x1234',
        createdOn: '2023-01-01T00:00:00.000Z',
        dropIds: [1],
        description: 'This is a test description',
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const result = await api.createMoment(createMomentInput);
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when AuthenticationProvider is not provided', async () => {
      api = new PoapMomentsApi({});
      await expect(api.createMoment(createMomentInput)).rejects.toThrow();
    });

    it('should allow Moment creation without any drop', async () => {
      const mockResponse: CreateMomentResponse = {
        id: '1',
        author: '0x1234',
        createdOn: '2023-01-01T00:00:00.000Z',
        dropIds: [],
        description: 'This is a test description',
      };
      fetchMock.mockResponseOnce(JSON.stringify(mockResponse));

      const input = { ...createMomentInput };
      delete input.dropIds;

      const result = await api.createMoment(input);
      expect(result).toEqual(mockResponse);
    });
  });
});
