import type { NextRequest } from 'next/server';
import {
  assertRequestedClientId,
  privateJson,
  withAuthenticatedClient,
} from '../../../../../lib/client-api';
import { getOwnBookingForSession } from '../../../../../lib/group-bookings';

type RouteContext = { params: Promise<{ groupSessionId: string }> };

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: RouteContext) {
  return withAuthenticatedClient(request, async (context) => {
    assertRequestedClientId(context, request.nextUrl.searchParams.get('clientId'));
    const { groupSessionId } = await params;
    return privateJson({
      booking: await getOwnBookingForSession(context.clientId, groupSessionId),
    });
  });
}
