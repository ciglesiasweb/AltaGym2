import type { NextRequest } from 'next/server';
import {
  assertRequestedClientId,
  privateJson,
  withAuthenticatedClient,
} from '../../../lib/client-api';
import { listGroupSessions } from '../../../lib/group-bookings';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  return withAuthenticatedClient(request, async (context) => {
    const parameters = request.nextUrl.searchParams;
    assertRequestedClientId(context, parameters.get('clientId'));
    const disciplineId = parameters.get('disciplineId');
    if (!disciplineId) {
      return privateJson({ error: 'DISCIPLINE_REQUIRED' }, 400);
    }

    return privateJson({
      sessions: await listGroupSessions(context.clientId, disciplineId),
    });
  });
}
