import { NextResponse, type NextRequest } from 'next/server';
import {
  assertClientIdMatchesContext,
  ClientContextError,
  clientContextErrorResponse,
  resolveClientContext,
  type ClientAuthContext,
} from './client-context';
import { GroupBookingError } from './group-booking-domain';
import { clientIdentityRepository } from './client-identity-repository';

export class ClientApiInputError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

export function privateJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

export function assertRequestedClientId(
  context: ClientAuthContext,
  requestedClientId: unknown,
): void {
  if (requestedClientId === undefined || requestedClientId === null) {
    return;
  }
  if (typeof requestedClientId !== 'string') {
    throw new ClientApiInputError('INVALID_CLIENT_ID');
  }
  assertClientIdMatchesContext(context, requestedClientId);
}

export async function readJsonObject(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ClientApiInputError('INVALID_JSON');
    }
    throw error;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ClientApiInputError('INVALID_BODY');
  }
  return value as Record<string, unknown>;
}

export async function withAuthenticatedClient(
  request: NextRequest,
  action: (context: ClientAuthContext) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const context = await resolveClientContext(request, clientIdentityRepository);
    return await action(context);
  } catch (error) {
    if (error instanceof ClientContextError) {
      return clientContextErrorResponse(error);
    }
    if (error instanceof GroupBookingError) {
      return privateJson({ error: error.code }, 409);
    }
    if (error instanceof ClientApiInputError) {
      return privateJson({ error: error.code }, 400);
    }
    throw error;
  }
}
