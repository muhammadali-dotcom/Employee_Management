import { createApiClient } from '../api';

const jsonResponse = (body: unknown, ok = true, status = ok ? 200 : 400) => ({
  ok,
  status,
  json: async () => body,
  text: async () => JSON.stringify(body),
});

describe('createApiClient — silent refresh on 401 (TC-AUTH-017, TC-AUTH-018)', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // TC-AUTH-017
  test('expired access token triggers a silent refresh then retries the original request', async () => {
    const getToken = jest.fn().mockReturnValue('expired-token');
    const refreshToken = jest.fn().mockResolvedValue('fresh-token');
    const onAuthFailure = jest.fn();

    let call = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      call += 1;
      // 1st call: protected request with the expired token -> 401.
      // 2nd call: same request retried with the refreshed token -> success.
      if (call === 1) return Promise.resolve(jsonResponse({ error: 'Token expired' }, false, 401));
      return Promise.resolve(jsonResponse({ data: 'ok' }));
    }) as jest.Mock;

    const api = createApiClient(getToken, refreshToken, onAuthFailure);
    const result = await api('/api/employees');

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(onAuthFailure).not.toHaveBeenCalled();
    expect(result).toEqual({ data: 'ok' });
  });

  // TC-AUTH-018
  test('expired refresh token forces logout (no valid retry possible)', async () => {
    const getToken = jest.fn().mockReturnValue('expired-token');
    const refreshToken = jest.fn().mockResolvedValue(null); // refresh cookie also expired
    const onAuthFailure = jest.fn();

    global.fetch = jest.fn().mockResolvedValue(jsonResponse({ error: 'Token expired' }, false, 401));

    const api = createApiClient(getToken, refreshToken, onAuthFailure);

    await expect(api('/api/employees')).rejects.toThrow(/session expired/i);
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(onAuthFailure).toHaveBeenCalledTimes(1);
    // No retry attempted once refreshToken() couldn't produce a new token.
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
