import {
  Transaction,
  TransactionStatus,
} from '../../src/providers/ports/TokensApiProvider/types/Transaction';
import { MintCodeInput } from '../../src/providers/ports/TokensApiProvider/types/MintCodeInput';
import {
  GetMintCodeResponse,
  PostMintCodeResponse,
} from '../../src/providers/ports/TokensApiProvider/types/MintCodeResponse';
import { PoapTokenApi } from '../../src/providers/core/PoapTokenApi/PoapTokenApi';
import { AuthToken } from '../../src/providers/ports/AuthenticationProvider/types/AuthToken';
import { mock } from 'node:test';

describe('PoapTokenApi', () => {
  let api: PoapTokenApi;
  const apiKey = 'test-api-key';
  const baseUrl = 'https://api.poap.tech';
  const mockAuthToken: AuthToken = {
    accessToken: 'mockAccessToken',
    tokenType: 'Bearer',
  };

  const mockAuthenticationProvider = {
    getAuthToken: jest.fn().mockResolvedValue(mockAuthToken),
  };

  beforeEach(() => {
    api = new PoapTokenApi({
      apiKey,
      baseUrl,
      authenticationProvider: mockAuthenticationProvider,
    });
  });

  describe('getMintCode', () => {
    it('should retrieve the mint code details', async () => {
      const mockCode = 'mockCode12345';
      const mockResponse: GetMintCodeResponse = {
        id: 1,
        qr_hash: mockCode,
        tx_hash: '0xABC123DEF456',
        event_id: 2,
        beneficiary: '0xAddress1',
        user_input: 'userInputData',
        signer: '0xSigner1',
        claimed: true,
        claimed_date: '2023-09-26T10:30:00Z',
        created_date: '2023-09-01T10:30:00Z',
        is_active: true,
        secret: 'secretCode1',
        event: {
          id: 3,
          fancy_id: 'eventId3',
          name: 'POAP Event',
          description: 'Description for POAP Event',
          city: 'Metropolis',
          country: 'Etherland',
          event_url: 'https://poap.event.xyz',
          image_url: 'https://poap.image.xyz',
          animation_url: 'https://poap.animation.xyz',
          year: 2023,
          start_date: '2023-09-20T10:30:00Z',
          end_date: '2023-09-22T10:30:00Z',
          expiry_date: '2024-09-22T10:30:00Z',
          from_admin: false,
          virtual_event: true,
          private_event: false,
        },
        tx_status: 'SUCCESS',
        result: {
          token: 1001,
        },
      };

      mock.method(global, 'fetch', () => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      });

      const result = await api.getMintCode(mockCode);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('postMintCode', () => {
    it('should post a new mint code to the API', async () => {
      const mockInput: MintCodeInput = {
        address: '0xAddress1',
        qr_hash: 'mockQrHash1',
        sendEmail: true,
      };
      const mockResponse: PostMintCodeResponse = {
        id: 4,
        qr_hash: 'mockQrHash1',
        queue_uid: 'mockQueueUid1',
        event_id: 5,
        beneficiary: '0xAddress1',
        user_input: 'userInputData2',
        signer: '0xSigner2',
        claimed: false,
        claimed_date: '2023-09-26T10:40:00Z',
        created_date: '2023-09-01T10:40:00Z',
        is_active: true,
        event: {
          id: 3,
          fancy_id: 'eventId3',
          name: 'POAP Event',
          description: 'Description for POAP Event',
          city: 'Metropolis',
          country: 'Etherland',
          event_url: 'https://poap.event.xyz',
          image_url: 'https://poap.image.xyz',
          animation_url: 'https://poap.animation.xyz',
          year: 2023,
          start_date: '2023-09-20T10:30:00Z',
          end_date: '2023-09-22T10:30:00Z',
          expiry_date: '2024-09-22T10:30:00Z',
          from_admin: false,
          virtual_event: true,
          private_event: false,
        },
      };

      mock.method(global, 'fetch', () => {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      });

      const result = await api.postMintCode(mockInput);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('mintStatus', () => {
    const QR_HASH = 'mockQrHash1';

    it('should retrieve a Transaction associated with a mint-link when exists', async () => {
      //GIVEN
      const transaction: Transaction = {
        tx_hash: '0xABC123DEF456',
        status: TransactionStatus.passed,
      };
      mock.method(global, 'fetch', () => {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total: 1,
              transactions: [{ ...transaction }],
            }),
        });
      });

      //WHEN
      const result = await api.getMintTransaction(QR_HASH);

      //THEN
      expect(result).toEqual(transaction);
    });

    it('should return null when no Transaction is associated with a mint-link', async () => {
      //GIVEN
      mock.method(global, 'fetch', () => {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total: 0,
              transactions: [],
            }),
        });
      });

      //WHEN
      const result = await api.getMintTransaction(QR_HASH);

      //THEN
      expect(result).toBeNull();
    });

    it('should return null when the Transaction associated with a mint-link is waiting', async () => {
      //GIVEN
      mock.method(global, 'fetch', () => {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              total: 1,
              transactions: [{ status: TransactionStatus.waiting }],
            }),
        });
      });

      //WHEN
      const result = await api.getMintTransaction(QR_HASH);

      //THEN
      expect(result).toBeNull();
    });
  });
});
