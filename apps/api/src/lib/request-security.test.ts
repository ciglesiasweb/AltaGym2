import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import {
  applyCors,
  configuredWebOrigin,
  enforceRequestOrigin,
} from './request-security';

const allowedOrigin = 'https://web.example.test';

describe('request security', () => {
  beforeEach(() => {
    vi.stubEnv('WEB_ORIGIN', allowedOrigin);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses a concrete configured origin and rejects wildcard configuration', () => {
    expect(configuredWebOrigin()).toBe(allowedOrigin);
    vi.stubEnv('WEB_ORIGIN', 'https://*.example.test');
    expect(() => configuredWebOrigin()).toThrow('concrete HTTP(S) origin');
  });

  it('allows credentialed CORS only for the configured origin', () => {
    const allowedResponse = applyCors(NextResponse.json({ ok: true }), allowedOrigin);
    expect(allowedResponse.headers.get('Access-Control-Allow-Origin')).toBe(allowedOrigin);
    expect(allowedResponse.headers.get('Access-Control-Allow-Credentials')).toBe('true');
    expect(allowedResponse.headers.get('Access-Control-Allow-Origin')).not.toBe('*');
    expect(allowedResponse.headers.get('Vary')).toBe('Origin');

    const rejectedResponse = applyCors(
      NextResponse.json({ error: 'UNAUTHORIZED' }),
      'https://attacker.example.test',
    );
    expect(rejectedResponse.headers.has('Access-Control-Allow-Origin')).toBe(false);
    expect(rejectedResponse.headers.has('Access-Control-Allow-Credentials')).toBe(false);
  });

  it.each([
    ['a foreign origin', 'https://attacker.example.test'],
    ['a missing origin', null],
  ])('rejects a mutation with %s', (_description, origin) => {
    const headers = origin ? { origin } : undefined;
    const request = new NextRequest('https://api.example.test/api/booking', {
      method: 'POST',
      headers,
    });

    const response = enforceRequestOrigin(request);
    expect(response?.status).toBe(401);
    expect(response?.headers.get('Cache-Control')).toBe('no-store');
  });

  it('rejects a foreign origin on a read request and permits an allowed origin', () => {
    expect(
      enforceRequestOrigin(
        new NextRequest('https://api.example.test/api/booking', {
          headers: { origin: 'https://attacker.example.test' },
        }),
      ),
    ).toMatchObject({ status: 401 });

    expect(
      enforceRequestOrigin(
        new NextRequest('https://api.example.test/api/booking', {
          method: 'POST',
          headers: { origin: allowedOrigin },
        }),
      ),
    ).toBeUndefined();
  });
});
