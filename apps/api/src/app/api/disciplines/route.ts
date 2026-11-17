import type { NextRequest } from 'next/server';
import {
  assertRequestedClientId,
  privateJson,
  withAuthenticatedClient,
} from '../../../lib/client-api';
import { listDisciplines } from '../../../lib/group-bookings';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  return withAuthenticatedClient(request, async (context) => {
    assertRequestedClientId(context, request.nextUrl.searchParams.get('clientId'));
    return privateJson({ disciplines: await listDisciplines() });
  });
}
