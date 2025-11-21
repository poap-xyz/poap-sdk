import { mock, MockProxy } from 'jest-mock-extended';
import { MomentsClient } from './MomentsClient.js';
import { CreateMomentInput } from './dtos/create/CreateInput.js';
import { CreateSteps } from './dtos/create/CreateSteps.js';
import { v4 } from 'uuid';
import { CreateAndUploadMomentInput } from './dtos/create/CreateAndUploadInput.js';
import { PoapCompass, PoapMomentsApi } from '../../providers/index.js';

describe('MomentsClient', () => {
  const MOMENT_ID = 'this-is-a-moment-id';
  const DROP_IDS = [420];
  const AUTHOR = '0x7CE5368171cC3D988157d7dab3D313d7bd43de3e';
  const FILE_1 = Uint8Array.from('This is the file 1');
  const FILE_1_TYPE = 'image/png';
  const FILE_2 = Uint8Array.from('This is the file 2');
  const FILE_2_TYPE = 'image/jpeg';
  const MEDIA_UPLOAD_URL = 'this-is-a-media-upload-url';
  const DESCRIPTION = 'This is a description';
  const MEDIAS_TO_CREATE = [
    {
      fileBinary: FILE_1,
      fileType: FILE_1_TYPE,
    },
    {
      fileBinary: FILE_2,
      fileType: FILE_2_TYPE,
    },
  ];
  const MEDIA_KEYS = [
    '45201634-1996-4243-9c24-31da706be427',
    'fbc3cf5f-fd65-4d2f-88fa-7025ebc7d631',
  ];

  let poapMomentsAPIMocked: MockProxy<PoapMomentsApi>;
  let compassProviderMocked: MockProxy<PoapCompass>;
  let onStepUpdate: jest.Mock;

  beforeEach(() => {
    poapMomentsAPIMocked = mock<PoapMomentsApi>();
    compassProviderMocked = mock<PoapCompass>();
    onStepUpdate = jest.fn();
  });

  describe('createMomentAndUploadMedia', () => {
    it('should create a moment and upload media', async () => {
      // GIVEN
      const client = new MomentsClient(
        poapMomentsAPIMocked,
        compassProviderMocked,
      );
      const inputs: CreateAndUploadMomentInput = {
        dropIds: DROP_IDS,
        media: MEDIAS_TO_CREATE,
        author: AUTHOR,
        onStepUpdate,
        description: DESCRIPTION,
      };
      poapMomentsAPIMocked.createMoment.mockResolvedValue({
        id: MOMENT_ID,
        author: AUTHOR,
        createdOn: new Date().toISOString(),
        dropIds: DROP_IDS,
        description: DESCRIPTION,
      });
      const mediaKeys: string[] = [];
      poapMomentsAPIMocked.getSignedUrl.mockImplementation(async () => {
        const key = v4();
        mediaKeys.push(key);
        return {
          url: MEDIA_UPLOAD_URL,
          key,
        };
      });

      const EXPECTED_MOMENT_CREATE_INPUT = {
        dropIds: DROP_IDS,
        author: AUTHOR,
        description: DESCRIPTION,
        mediaKeys,
      };

      // WHEN
      const moment = await client.createMomentAndUploadMedia(inputs);

      // THEN
      expect(moment.id).toBe(MOMENT_ID);
      expect(moment.author).toBe(AUTHOR);
      expect(moment.dropIds).toBe(DROP_IDS);
      expect(poapMomentsAPIMocked.createMoment).toHaveBeenCalledWith(
        EXPECTED_MOMENT_CREATE_INPUT,
      );
      expect(poapMomentsAPIMocked.getSignedUrl).toHaveBeenCalledTimes(2);
      expect(poapMomentsAPIMocked.uploadFile).toHaveBeenCalledWith(
        FILE_1,
        MEDIA_UPLOAD_URL,
        FILE_1_TYPE,
      );
      expect(poapMomentsAPIMocked.uploadFile).toHaveBeenCalledWith(
        FILE_2,
        MEDIA_UPLOAD_URL,
        FILE_2_TYPE,
      );
      expect(onStepUpdate).toHaveBeenCalledWith(CreateSteps.UPLOADING_MEDIA);
      expect(onStepUpdate).toHaveBeenCalledWith(CreateSteps.PROCESSING_MEDIA);
      expect(onStepUpdate).toHaveBeenCalledWith(CreateSteps.UPLOADING_MOMENT);
      expect(onStepUpdate).toHaveBeenCalledWith(CreateSteps.FINISHED);
      expect(onStepUpdate).toHaveBeenCalledTimes(4);
    });
  });
  describe('createMoment', () => {
    it('should create a moment and attach media keys', async () => {
      // GIVEN
      const client = new MomentsClient(
        poapMomentsAPIMocked,
        compassProviderMocked,
      );
      const inputs: CreateMomentInput = {
        dropIds: DROP_IDS,
        mediaKeys: MEDIA_KEYS,
        author: AUTHOR,
        onStepUpdate,
        description: DESCRIPTION,
      };
      poapMomentsAPIMocked.createMoment.mockResolvedValue({
        id: MOMENT_ID,
        author: AUTHOR,
        createdOn: new Date().toISOString(),
        dropIds: DROP_IDS,
      });

      const EXPECTED_MOMENT_CREATE_INPUT = {
        dropIds: DROP_IDS,
        author: AUTHOR,
        description: DESCRIPTION,
        mediaKeys: MEDIA_KEYS,
      };

      // WHEN
      const moment = await client.createMoment(inputs);

      // THEN
      expect(moment.id).toBe(MOMENT_ID);
      expect(moment.author).toBe(AUTHOR);
      expect(moment.dropIds).toBe(DROP_IDS);
      expect(poapMomentsAPIMocked.createMoment).toHaveBeenCalledWith(
        EXPECTED_MOMENT_CREATE_INPUT,
      );
      expect(poapMomentsAPIMocked.uploadFile).not.toHaveBeenCalledWith();
      expect(onStepUpdate).toHaveBeenCalledWith(CreateSteps.UPLOADING_MOMENT);
      expect(onStepUpdate).toHaveBeenCalledWith(CreateSteps.FINISHED);
      expect(onStepUpdate).toHaveBeenCalledTimes(2);
    });

    it('should allow creation of a moment without any drops', async () => {
      // GIVEN
      const client = new MomentsClient(
        poapMomentsAPIMocked,
        compassProviderMocked,
      );
      const inputs: CreateMomentInput = {
        mediaKeys: MEDIA_KEYS,
        author: AUTHOR,
        description: DESCRIPTION,
      };
      poapMomentsAPIMocked.createMoment.mockResolvedValue({
        id: MOMENT_ID,
        author: AUTHOR,
        createdOn: new Date().toISOString(),
        dropIds: [],
      });

      const EXPECTED_MOMENT_CREATE_INPUT = {
        author: AUTHOR,
        description: DESCRIPTION,
        mediaKeys: MEDIA_KEYS,
      };

      // WHEN
      const moment = await client.createMoment(inputs);

      // THEN
      expect(moment.id).toBe(MOMENT_ID);
      expect(moment.author).toBe(AUTHOR);
      expect(moment.dropIds).toEqual([]);
      expect(poapMomentsAPIMocked.createMoment).toHaveBeenCalledWith(
        EXPECTED_MOMENT_CREATE_INPUT,
      );
    });
  });
});
