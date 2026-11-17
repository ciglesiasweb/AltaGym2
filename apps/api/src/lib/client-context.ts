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
    { error: 'UNAUTHORIZED' },
    { status: error.status, headers: { 'Cache-Control': 'no-store' } },
  );
}

type SessionReader = (request: NextRequest) => Promise<SessionData | null>;

export async function resolveClientContext(
  request: NextRequest,
  repository: ClientIdentityRepository,
  readSession: SessionReader = (currentRequest) => auth0.getSession(currentRequest),
): Promise<ClientAuthContext> {
  const session: SessionData | null = await readSession(request);
  const subject = session?.user?.sub;

  if (typeof subject !== 'string' || subject.trim().length === 0) {
    throw new ClientContextError(401, 'UNAUTHENTICATED');
  }

  const provider: AuthIdentityRecord['provider'] =
    process.env.NODE_ENV === 'test' ? 'MOCK' : 'AUTH0';
  const identity = await repository.findAuthIdentity(provider, subject);
  if (
    !identity ||
    identity.provider !== provider ||
    identity.externalSubject !== subject
  ) {
    throw new ClientContextError(403, 'UNAUTHORIZED');
  }

  const account = await repository.findUserAccount(identity.userAccountId);
  if (
    !account ||
    account.id !== identity.userAccountId ||
    account.role !== 'CLIENT' ||
    account.status !== 'ACTIVE'
  ) {
    throw new ClientContextError(403, 'UNAUTHORIZED');
  }

  const client = await repository.findClientByUserAccountId(account.id);
  if (
    !client ||
    client.userAccountId !== account.id ||
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

export function assertClientIdMatchesContext(
  context: ClientAuthContext,
  requestedClientId: string | null | undefined,
): void {
  if (requestedClientId != null && requestedClientId !== context.clientId) {
    throw new ClientContextError(403, 'UNAUTHORIZED');
  }
}
