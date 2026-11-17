import type { SessionData } from '@auth0/nextjs-auth0/types';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth0 } from './auth0';

type AccountRole = 'CLIENT' | 'MONITOR' | 'RECEPTION';
type AccountStatus = 'ACTIVE' | 'INACTIVE';
type ClientStatus = 'ACTIVE' | 'INACTIVE';

export interface AuthIdentityRecord {
  userAccountId: string;
  provider: 'AUTH0' | 'MOCK';
  externalSubject: string;
}

export interface UserAccountRecord {
  id: string;
  role: AccountRole;
  status: AccountStatus;
}

export interface ClientRecord {
  id: string;
  userAccountId: string;
  status: ClientStatus;
}

export interface ClientIdentityRepository {
  findAuthIdentity(provider: AuthIdentityRecord['provider'], subject: string): Promise<AuthIdentityRecord | null>;
  findUserAccount(id: string): Promise<UserAccountRecord | null>;
  findClientByUserAccountId(userAccountId: string): Promise<ClientRecord | null>;
}

export interface ClientAuthContext {
  userAccountId: string;
  clientId: string;
  subject: string;
}

export class ClientContextError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: 'UNAUTHENTICATED' | 'UNAUTHORIZED',
  ) {
    super(code);
  }
}

export function clientContextErrorResponse(error: ClientContextError): NextResponse {
  return NextResponse.json(
    { error: error.code },
    { status: error.status, headers: { 'Cache-Control': 'no-store' } },
  );
}

type SessionReader = (request: NextRequest) => Promise<SessionData | null>;

export async function resolveClientContext(
  request: NextRequest,
  repository: ClientIdentityRepository,
  readSession: SessionReader = (currentRequest) => auth0.getSession(currentRequest),
): Promise<ClientAuthContext> {
  const session = await readSession(request);
  const subject = session?.user?.sub;

  if (!subject) {
    throw new ClientContextError(401, 'UNAUTHENTICATED');
  }

  const identity = await repository.findAuthIdentity('AUTH0', subject);
  const account = identity
    ? await repository.findUserAccount(identity.userAccountId)
    : null;
  const client = account
    ? await repository.findClientByUserAccountId(account.id)
    : null;

  if (
    !identity ||
    !account ||
    account.role !== 'CLIENT' ||
    account.status !== 'ACTIVE' ||
    !client ||
    client.status !== 'ACTIVE'
  ) {
    throw new ClientContextError(403, 'UNAUTHORIZED');
  }

  return {
    userAccountId: account.id,
    clientId: client.id,
    subject,
  };
}
