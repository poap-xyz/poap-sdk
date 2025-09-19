import { mock } from 'node:test';
import { AuthenticationProviderHttp } from '../../src/providers/core/AuthenticationProviderHttp/AuthenticationProviderHttp';
import { jest } from '@jest/globals';

const DATETIME = new Date('2026-09-19 18:00:00');

jest
  .useFakeTimers()
  .setSystemTime(DATETIME);

describe('AuthenticationProviderHttp', () => {
  const CLIENT_ID = 'CLIENT_ID';
  const CLIENT_SECRET = 'CLIENT_SECRET';
  const ACCESS_TOKEN = 'ACCESS_TOKEN';
  const ACCESS_TOKEN_2 = 'ACCESS_TOKEN_2';
  const EXPIRES_IN = 3600;
  const AUDIENCE = 'audience.test';
  const AUTH_SERVER = 'auth.test';

  it('should return an Access Token', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    const result = await provider.getAuthToken(AUDIENCE);

    expect(result).toEqual({
      accessToken: ACCESS_TOKEN,
      tokenType: 'Bearer',
      expiresAt: new Date(DATETIME.getTime() + EXPIRES_IN * 1000),
    });

    mock.reset();
  });

  it('should request only one Access Token when Token is still valid', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    const result1 = await provider.getAuthToken(AUDIENCE);
    const result2 = await provider.getAuthToken(AUDIENCE);

    expect(result1.accessToken).toEqual(ACCESS_TOKEN);
    expect(result2.accessToken).toEqual(ACCESS_TOKEN);

    mock.reset();
  });

  it('should request a new Access Token when Token is expired', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    jest.useFakeTimers();

    const result1 = await provider.getAuthToken(AUDIENCE);

    jest.advanceTimersByTime(EXPIRES_IN * 1000 + 1);

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN_2,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    const result2 = await provider.getAuthToken(AUDIENCE);

    expect(result1.accessToken).toEqual(ACCESS_TOKEN);
    expect(result2.accessToken).toEqual(ACCESS_TOKEN_2);

    jest.useRealTimers();
    mock.reset();
  });
});
