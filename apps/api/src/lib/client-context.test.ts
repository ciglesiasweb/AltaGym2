import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { auth0 } from './auth0';
import {
  assertClientIdMatchesContext,
  ClientContextError,
  clientContextErrorResponse,
  resolveClientContext,
  type ClientAuthContext,
  type ClientIdentityRepository,
} from './client-context';

vi.mock('./auth0', () => ({ auth0: { getSession: vi.fn() } }));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

const subject = 'mock|stable-client-a';
const provider = process.env.NODE_ENV === 'test' ? 'MOCK' : 'AUTH0';
const request = new NextRequest(
  'http://localhost/api/protected?clientId=client-b',
  {
    method: 'POST',
    headers: { 'x-client-id': 'client-b', 'content-type': 'application/json' },
    body: JSON.stringify({ clientId: 'client-b' }),
  },
);
const stableTestSession = async () => ({ user: { sub: subject } }) as never;

function repositoryFor(
  overrides: Partial<{
    identity: Awaited<ReturnType<ClientIdentityRepository['findAuthIdentity']>>;
    account: Awaited<ReturnType<ClientIdentityRepository['findUserAccount']>>;
    client: Awaited<ReturnType<ClientIdentityRepository['findClientByUserAccountId']>>;
  }> = {},
): ClientIdentityRepository {
  return {
    findAuthIdentity: vi.fn(async () => overrides.identity === undefined
      ? { userAccountId: 'account-a', provider, externalSubject: subject }
      : overrides.identity),
    findUserAccount: vi.fn(async () => overrides.account === undefined
      ? { id: 'account-a', role: 'CLIENT' as const, status: 'ACTIVE' as const }
      : overrides.account),
    findClientByUserAccountId: vi.fn(async () => overrides.client === undefined
      ? { id: 'client-a', userAccountId: 'account-a', status: 'ACTIVE' as const }
      : overrides.client),
  };
}

describe('resolveClientContext', () => {
  it('passes the cookie-bearing request to the server-side Auth0 session reader', async () => {
    const cookieRequest = new NextRequest('http://localhost/api/protected', {
      headers: { cookie: 'appSession=opaque-session' },
    });
    const repository = repositoryFor();
    vi.mocked(auth0.getSession).mockResolvedValueOnce({ user: { sub: subject } } as never);

    await expect(resolveClientContext(cookieRequest, repository)).resolves.toMatchObject({
      clientId: 'client-a',
      subject,
    });

    expect(auth0.getSession).toHaveBeenCalledOnce();
    expect(vi.mocked(auth0.getSession).mock.calls[0][0]).toBe(cookieRequest);
    expect(cookieRequest.headers.get('authorization')).toBeNull();
  });

  it('resolves an active client only from the stable validated session subject', async () => {
    const repository = repositoryFor();

    await expect(resolveClientContext(request, repository, stableTestSession)).resolves.toEqual({
      userAccountId: 'account-a',
      clientId: 'client-a',
      subject,
    });

    expect(repository.findAuthIdentity).toHaveBeenCalledExactlyOnceWith(provider, subject);
    expect(repository.findClientByUserAccountId).toHaveBeenCalledExactlyOnceWith('account-a');
  });

  it.each([
    ['session is absent', async () => null],
    ['session is invalidated', async () => null],
    ['session has no subject', async () => ({ user: {} }) as never],
  ])('rejects when %s without querying identity', async (_description, readSession) => {
    const repository = repositoryFor();

    await expect(resolveClientContext(request, repository, readSession)).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
    expect(repository.findAuthIdentity).not.toHaveBeenCalled();
  });

  it('surfaces unexpected session-reader failures instead of treating them as anonymous', async () => {
    await expect(
      resolveClientContext(request, repositoryFor(), async () => {
        throw new Error('session service unavailable');
      }),
    ).rejects.toThrow('session service unavailable');
  });

  it('uses the AUTH0 provider outside the test environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const repository = repositoryFor({
      identity: {
        userAccountId: 'account-a',
        provider: 'AUTH0',
        externalSubject: subject,
      },
    });

    await resolveClientContext(request, repository, stableTestSession);

    expect(repository.findAuthIdentity).toHaveBeenCalledExactlyOnceWith('AUTH0', subject);
  });

  it.each(['MONITOR', 'RECEPTION'] as const)(
    'rejects an active account with role %s',
    async (role) => {
      const repository = repositoryFor({
        account: { id: 'account-a', role, status: 'ACTIVE' },
      });

      await expect(
        resolveClientContext(request, repository, stableTestSession),
      ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
      expect(repository.findClientByUserAccountId).not.toHaveBeenCalled();
    },
  );

  it('rejects an inactive account before looking up its client', async () => {
    const repository = repositoryFor({
      account: { id: 'account-a', role: 'CLIENT', status: 'INACTIVE' },
    });

    await expect(
      resolveClientContext(request, repository, stableTestSession),
    ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
    expect(repository.findClientByUserAccountId).not.toHaveBeenCalled();
  });

  it('rejects an inactive or missing client', async () => {
    for (const client of [
      { id: 'client-a', userAccountId: 'account-a', status: 'INACTIVE' as const },
      null,
    ]) {
      const repository = repositoryFor({ client });
      await expect(
        resolveClientContext(request, repository, stableTestSession),
      ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
    }
  });

  it('rejects an unlinked external identity without resolving an account', async () => {
    const repository = repositoryFor({ identity: null });

    await expect(
      resolveClientContext(request, repository, stableTestSession),
    ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
    expect(repository.findUserAccount).not.toHaveBeenCalled();
  });

  it('rejects identity and client links that do not match the resolved account', async () => {
    const mismatchedIdentity = repositoryFor({
      identity: {
        userAccountId: 'account-b',
        provider,
        externalSubject: subject,
      },
    });
    await expect(
      resolveClientContext(request, mismatchedIdentity, stableTestSession),
    ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });

    const mismatchedClient = repositoryFor({
      client: { id: 'client-b', userAccountId: 'account-b', status: 'ACTIVE' },
    });
    await expect(
      resolveClientContext(request, mismatchedClient, stableTestSession),
    ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
  });
});

describe('assertClientIdMatchesContext', () => {
  const context: ClientAuthContext = {
    userAccountId: 'account-a',
    clientId: 'client-a',
    subject,
  };

  it.each([undefined, null, 'client-a'])(
    'accepts an absent or matching clientId (%s)',
    (requestedClientId) => {
      expect(() => assertClientIdMatchesContext(context, requestedClientId)).not.toThrow();
    },
  );

  it('rejects a foreign clientId with the same neutral response regardless of its existence', async () => {
    const repository = repositoryFor();
    const context = await resolveClientContext(request, repository, stableTestSession);
    const mismatchErrors = ['client-b', 'unknown-client'].map((clientId) => {
      try {
        assertClientIdMatchesContext(context, clientId);
        return null;
      } catch (error) {
        return error;
      }
    });

    expect(mismatchErrors).toHaveLength(2);
    expect(mismatchErrors).toEqual([
      expect.objectContaining({ status: 403, code: 'UNAUTHORIZED' }),
      expect.objectContaining({ status: 403, code: 'UNAUTHORIZED' }),
    ]);
    expect(repository.findAuthIdentity).toHaveBeenCalledExactlyOnceWith(provider, subject);
    expect(repository.findClientByUserAccountId).toHaveBeenCalledExactlyOnceWith('account-a');

    const responses = await Promise.all(
      (mismatchErrors as ClientContextError[]).map((error) =>
        clientContextErrorResponse(error).json(),
      ),
    );
    expect(responses).toEqual([
      { error: 'UNAUTHORIZED' },
      { error: 'UNAUTHORIZED' },
    ]);
  });

  it('returns a neutral, non-cacheable 401 response for an absent or invalid session', async () => {
    const response = clientContextErrorResponse(
      new ClientContextError(401, 'UNAUTHENTICATED'),
    );

    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'UNAUTHORIZED' });
  });
});
