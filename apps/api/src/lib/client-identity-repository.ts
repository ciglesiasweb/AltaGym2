import type { ClientIdentityRepository } from './client-context';
import { prisma } from './prisma';

export const clientIdentityRepository: ClientIdentityRepository = {
  async findAuthIdentity(provider, subject) {
    const identity = await prisma.authIdentity.findUnique({
      where: {
        provider_externalSubject: {
          provider,
          externalSubject: subject,
        },
      },
      select: { userAccountId: true, provider: true, externalSubject: true },
    });

    return identity
      ? {
          userAccountId: identity.userAccountId,
          provider: identity.provider,
          externalSubject: identity.externalSubject,
        }
      : null;
  },

  async findUserAccount(id) {
    const account = await prisma.userAccount.findUnique({
      where: { id },
      select: { id: true, role: true, status: true },
    });

    return account
      ? {
          id: account.id,
          role: account.role,
          status: account.status,
        }
      : null;
  },

  async findClientByUserAccountId(userAccountId) {
    const client = await prisma.client.findUnique({
      where: { userAccountId },
      select: { id: true, userAccountId: true, status: true },
    });

    return client
      ? {
          id: client.id,
          userAccountId: client.userAccountId,
          status: client.status,
        }
      : null;
  },
};
