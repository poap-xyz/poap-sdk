import { mock } from 'node:test';
import { jest } from '@jest/globals';
import { AuthenticationProviderHttp } from '../../src/providers/core/AuthenticationProviderHttp/AuthenticationProviderHttp';
import { UnauthorizedClientError } from '../../src/providers/ports/AuthenticationProvider/errors/UnauthorizedClientError';

describe('AuthenticationProviderHttp', () => {
  const CLIENT_ID = 'client_id';
  const CLIENT_SECRET = 'client_secret';
  const ACCESS_TOKEN = 'access_token';
  const ACCESS_TOKEN_2 = 'access_token_2';
  const EXPIRES_IN = 3600;
  const AUDIENCE = 'audience.test';
  const AUTH_SERVER = 'auth.test';
  const DATETIME = new Date('2026-09-19 18:00:00');

  it('should throw Error when given an oAuthServerDomain that starts with http', () => {
    expect(() => {
      new AuthenticationProviderHttp(CLIENT_ID, CLIENT_SECRET, 'https://accounts.poap.tech');
    }).toThrow(new Error('OAuth server domain must not start with HTTP'));
    expect(() => {
      new AuthenticationProviderHttp(CLIENT_ID, CLIENT_SECRET, 'HTTPS://ACCOUNTS.POAP.TECH');
    }).toThrow(new Error('OAuth server domain must not start with HTTP'));
  });

  it('should throw UnauthorizedClientError when response is 401', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: () =>
          Promise.resolve({
            'error': 'unauthorized_client',
          }),
      });
    });

    await expect(async () => {
      await provider.getAuthToken(AUDIENCE);
    }).rejects.toThrow(
      new UnauthorizedClientError(
        'CLIENT_ID',
        'audience.test',
      ),
    );
  });

  it('should throw Error when response is not 200', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: () =>
          Promise.resolve({
            'error': 'invalid_request',
          }),
      });
    });

    await expect(async () => {
      await provider.getAuthToken(AUDIENCE);
    }).rejects.toThrow(
      new Error('Could not authenticate to audience.test: Network response was not ok: Bad Request invalid_request'),
    );
  });

  it('should throw Error when response has no access_token', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            bad: 'response',
          }),
      });
    });

    await expect(async () => {
      await provider.getAuthToken(AUDIENCE);
    }).rejects.toThrow(
      new Error('Could not authenticate to audience.test: Invalid response: {"bad":"response"}'),
    );
  });

  it('should throw Error when response has no expires_in is set but not numeric', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: String(EXPIRES_IN),
          }),
      });
    });

    await expect(async () => {
      await provider.getAuthToken(AUDIENCE);
    }).rejects.toThrow(new Error('Could not authenticate to audience.test: Invalid response: {"access_token":"access_token","token_type":"Bearer","expires_in":"3600"}'));
  });

  it('should return an Access Token', async () => {
    const provider = new AuthenticationProviderHttp(
      CLIENT_ID,
      CLIENT_SECRET,
      AUTH_SERVER,
    );

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    jest.useFakeTimers().setSystemTime(DATETIME);

    const result = await provider.getAuthToken('audience.test');

    expect(result).toEqual({
      accessToken: 'access_token',
      tokenType: 'Bearer',
      expiresAt: new Date('2026-09-19 19:00:00'),
    });

    mock.reset();

    jest.useRealTimers();
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
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    const result1 = await provider.getAuthToken('audience.test');
    const result2 = await provider.getAuthToken('audience.test');

    expect(result1.accessToken).toEqual('access_token');
    expect(result2.accessToken).toEqual('access_token');

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
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    jest.useFakeTimers();

    const result1 = await provider.getAuthToken('audience.test');

    jest.advanceTimersByTime(3600 * 1000 + 1);

    mock.method(global, 'fetch', () => {
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () =>
          Promise.resolve({
            access_token: ACCESS_TOKEN_2,
            token_type: 'Bearer',
            expires_in: EXPIRES_IN,
          }),
      });
    });

    const result2 = await provider.getAuthToken('audience.test');

    expect(result1.accessToken).toEqual('access_token');
    expect(result2.accessToken).toEqual('access_token_2');

    jest.useRealTimers();

    mock.reset();
  });
});
