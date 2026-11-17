import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import {
  resolveClientContext,
  type ClientIdentityRepository,
} from './client-context';

const request = new NextRequest('http://localhost/api/protected');

function repositoryFor(role: 'CLIENT' | 'MONITOR' | 'RECEPTION'): ClientIdentityRepository {
  return {
    findAuthIdentity: async () => ({
      userAccountId: 'account-1',
      provider: 'AUTH0',
      externalSubject: 'auth0|subject-1',
    }),
    findUserAccount: async () => ({
      id: 'account-1',
      role,
      status: 'ACTIVE',
    }),
    findClientByUserAccountId: async () => ({
      id: 'client-1',
      userAccountId: 'account-1',
      status: 'ACTIVE',
    }),
  };
}

describe('resolveClientContext', () => {
  it('resolves an active CLIENT from the verified session subject', async () => {
    await expect(
      resolveClientContext(
        request,
        repositoryFor('CLIENT'),
        async () => ({ user: { sub: 'auth0|subject-1' } } as never),
      ),
    ).resolves.toEqual({
      userAccountId: 'account-1',
      clientId: 'client-1',
      subject: 'auth0|subject-1',
    });
  });

  it('rejects a valid session with an operational role', async () => {
    await expect(
      resolveClientContext(
        request,
        repositoryFor('MONITOR'),
        async () => ({ user: { sub: 'auth0|subject-1' } } as never),
      ),
    ).rejects.toMatchObject({ status: 403, code: 'UNAUTHORIZED' });
  });

  it('rejects a request without a session before querying identity', async () => {
    const repository = repositoryFor('CLIENT');
    const findAuthIdentity = repository.findAuthIdentity;
    repository.findAuthIdentity = async () => {
      throw new Error('identity lookup must not run');
    };

    await expect(
      resolveClientContext(request, repository, async () => null),
    ).rejects.toMatchObject({ status: 401, code: 'UNAUTHENTICATED' });

    repository.findAuthIdentity = findAuthIdentity;
  });
});
