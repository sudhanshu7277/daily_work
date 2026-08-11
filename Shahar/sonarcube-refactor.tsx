// cmd to run tests locally

npx vitest run --coverage

// Updated File: src/api/client.test.ts

// src/api/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Capture axios instance config + interceptor handlers registered by client.ts ---
const mockClientGet = vi.fn();
const mockClientPost = vi.fn();
const mockClientPut = vi.fn();

// The instance must be callable: the response interceptor does `client(originalRequest)`
const mockInstance: any = vi.fn();
mockInstance.get = mockClientGet;
mockInstance.post = mockClientPost;
mockInstance.put = mockClientPut;

let capturedConfig: any;
let requestInterceptor: (config: any) => any;
let responseFulfilled: (response: any) => any;
let responseRejected: (error: any) => any;

mockInstance.interceptors = {
  request: {
    use: (fn: any) => {
      requestInterceptor = fn;
    },
  },
  response: {
    use: (onFulfilled: any, onRejected: any) => {
      responseFulfilled = onFulfilled;
      responseRejected = onRejected;
    },
  },
};

vi.mock('axios', () => {
  const create = (config: any) => {
    capturedConfig = config;
    return mockInstance;
  };
  return {
    default: { create },
    create,
  };
});

// --- Mock the auth helpers used by the interceptors ---
const mockGetToken = vi.fn();
const mockClearAuth = vi.fn();
const mockLogin = vi.fn();

vi.mock('../utils/auth', () => ({
  getToken: mockGetToken,
  clearAuth: mockClearAuth,
  login: mockLogin,
}));

// Importing the module runs axios.create(...) and registers the interceptors
import client, { get, getRaw, post, put, del } from './client';

describe('api/client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('axios instance configuration', () => {
    it('sets the JSON content-type header', () => {
      expect(capturedConfig.headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('configures a baseURL', () => {
      expect(typeof capturedConfig.baseURL).toBe('string');
      expect(capturedConfig.baseURL.length).toBeGreaterThan(0);
    });
  });

  describe('paramsSerializer', () => {
    const serialize = (params: Record<string, unknown>) => {
      const ps = capturedConfig.paramsSerializer;
      return typeof ps === 'function' ? ps(params) : ps?.serialize?.(params);
    };

    it('serializes scalar params with URL encoding', () => {
      expect(serialize({ status: 'OPEN', page: 1 })).toBe('status=OPEN&page=1');
    });

    it('skips null and undefined values', () => {
      expect(serialize({ a: 1, b: null, c: undefined, d: 2 })).toBe('a=1&d=2');
    });

    it('expands array values into repeated keys', () => {
      expect(serialize({ country: ['US', 'UK'] })).toBe('country=US&country=UK');
    });

    it('url-encodes keys and values', () => {
      expect(serialize({ 'a b': 'c&d' })).toBe('a%20b=c%26d');
    });

    it('returns an empty string for no params', () => {
      expect(serialize({})).toBe('');
    });
  });

  describe('request interceptor', () => {
    it('adds an Authorization header when a token exists', () => {
      mockGetToken.mockReturnValue('jwt-123');
      const config = requestInterceptor({ headers: {} });
      expect(config.headers['Authorization']).toBe('Bearer jwt-123');
    });

    it('omits the Authorization header when there is no token', () => {
      mockGetToken.mockReturnValue(null);
      const config = requestInterceptor({ headers: {} });
      expect(config.headers['Authorization']).toBeUndefined();
    });

    it('defaults X-User-Id and X-User-Role when localStorage is empty', () => {
      mockGetToken.mockReturnValue(null);
      const config = requestInterceptor({ headers: {} });
      expect(config.headers['X-User-Id']).toBe('SYSTEM');
      expect(config.headers['X-User-Role']).toBe('ROLE_VIEW_ONLY');
    });

    it('uses stored X-User-Id and X-User-Role when present', () => {
      mockGetToken.mockReturnValue(null);
      localStorage.setItem('gab-user-id', 'ab12345');
      localStorage.setItem('gab-user-role', 'ROLE_MAKER');
      const config = requestInterceptor({ headers: {} });
      expect(config.headers['X-User-Id']).toBe('ab12345');
      expect(config.headers['X-User-Role']).toBe('ROLE_MAKER');
    });
  });

  describe('response interceptor', () => {
    it('passes successful responses through unchanged', () => {
      const response = { data: { ok: true } };
      expect(responseFulfilled(response)).toBe(response);
    });

    it('does a silent re-login on 401 and retries the original request', async () => {
      mockLogin.mockResolvedValue({ token: 'fresh-token' });
      mockInstance.mockResolvedValue('retried-response');

      const originalRequest: any = { headers: {} };
      const error = { config: originalRequest, response: { status: 401 } };

      const result = await responseRejected(error);

      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(originalRequest._retry).toBe(true);
      expect(originalRequest.headers['Authorization']).toBe('Bearer fresh-token');
      expect(mockInstance).toHaveBeenCalledWith(originalRequest);
      expect(result).toBe('retried-response');
    });

    it('clears auth and reloads when silent re-login fails', async () => {
      mockLogin.mockRejectedValue(new Error('login failed'));
      const reloadMock = vi.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadMock },
        writable: true,
      });

      const originalRequest: any = { headers: {} };
      const error = {
        config: originalRequest,
        response: { status: 401 },
        message: 'Unauthorized',
      };

      await expect(responseRejected(error)).rejects.toThrow('Unauthorized');
      expect(mockClearAuth).toHaveBeenCalledTimes(1);
      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it('does not retry a 401 that was already retried (_retry = true)', async () => {
      const originalRequest: any = { headers: {}, _retry: true };
      const error = {
        config: originalRequest,
        response: { status: 401, data: { message: 'Still unauthorized' } },
      };

      await expect(responseRejected(error)).rejects.toThrow('Still unauthorized');
      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('rejects with the server-provided message for non-401 errors', async () => {
      const error = {
        config: {},
        response: { status: 500, data: { message: 'Server exploded' } },
      };

      await expect(responseRejected(error)).rejects.toThrow('Server exploded');
    });

    it('falls back to error.message when there is no response body message', async () => {
      const error = { config: {}, message: 'Network Error' };

      await expect(responseRejected(error)).rejects.toThrow('Network Error');
    });

    it('falls back to a generic message when nothing else is available', async () => {
      const error = { config: {} };

      await expect(responseRejected(error)).rejects.toThrow('An unexpected error occurred');
    });
  });

  describe('request helper wrappers', () => {
    it('get() calls client.get with params and returns res.data', async () => {
      mockClientGet.mockResolvedValue({ data: { data: [1, 2], success: true } });

      const result = await get('/foo', { a: 1 });

      expect(mockClientGet).toHaveBeenCalledWith('/foo', { params: { a: 1 } });
      expect(result).toEqual({ data: [1, 2], success: true });
    });

    it('getRaw() calls client.get and returns the raw res.data', async () => {
      mockClientGet.mockResolvedValue({ data: ['x', 'y'] });

      const result = await getRaw('/bar');

      expect(mockClientGet).toHaveBeenCalledWith('/bar', { params: undefined });
      expect(result).toEqual(['x', 'y']);
    });

    it('post() calls client.post with the body and returns res.data', async () => {
      mockClientPost.mockResolvedValue({ data: { success: true } });

      const result = await post('/create', { name: 'x' });

      expect(mockClientPost).toHaveBeenCalledWith('/create', { name: 'x' });
      expect(result).toEqual({ success: true });
    });

    it('put() calls client.put with the body and returns res.data', async () => {
      mockClientPut.mockResolvedValue({ data: { success: true } });

      const result = await put('/update/1', { name: 'y' });

      expect(mockClientPut).toHaveBeenCalledWith('/update/1', { name: 'y' });
      expect(result).toEqual({ success: true });
    });

    it('del() actually issues a POST (per implementation) and returns res.data', async () => {
      mockClientPost.mockResolvedValue({ data: { success: true } });

      const result = await del('/remove/1');

      expect(mockClientPost).toHaveBeenCalledWith('/remove/1');
      expect(result).toEqual({ success: true });
    });
  });

  it('exports the axios instance as the default export', () => {
    expect(client).toBe(mockInstance);
  });
});