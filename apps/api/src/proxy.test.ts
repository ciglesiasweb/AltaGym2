import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const { middleware } = vi.hoisted(() => ({ middleware: vi.fn() }));

vi.mock('./lib/auth0', () => ({
  auth0: { middleware },
}));

import { proxy } from './proxy';

const allowedOrigin = 'https://web.example.test';

describe('API proxy request security', () => {
  beforeEach(() => {
    vi.stubEnv('WEB_ORIGIN', allowedOrigin);
    middleware.mockReset();
    middleware.mockResolvedValue(NextResponse.next());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ['a foreign origin', { origin: 'https://attacker.example.test' }],
    ['a missing origin', {}],
  ])('rejects a mutation with %s before Auth0 middleware', async (_description, headers) => {
    const request = new NextRequest('https://api.example.test/api/booking', {
      method: 'POST',
      headers,
    });

    const response = await proxy(request);
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: 'UNAUTHORIZED' });
    expect(middleware).not.toHaveBeenCalled();
  });

  it('rejects a foreign preflight before middleware', async () => {
    const response = await proxy(
      new NextRequest('https://api.example.test/api/booking', {
        method: 'OPTIONS',
        headers: {
          origin: 'https://attacker.example.test',
          'access-control-request-method': 'POST',
        },
      }),
    );

    expect(response.status).toBe(401);
    expect(middleware).not.toHaveBeenCalled();
    expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
  });

  it('passes an allowed credentialed API request and applies non-wildcard CORS', async () => {
    const response = await proxy(
      new NextRequest('https://api.example.test/api/booking', {
        method: 'POST',
        headers: { origin: allowedOrigin },
      }),
    );

    expect(middleware).toHaveBeenCalledOnce();
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(response.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
  });

  it('responds to an allowed preflight without invoking middleware', async () => {
    const response = await proxy(
      new NextRequest('https://api.example.test/api/booking', {
        method: 'OPTIONS',
        headers: {
          origin: allowedOrigin,
          'access-control-request-method': 'POST',
        },
      }),
    );

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(middleware).not.toHaveBeenCalled();
  });
});
