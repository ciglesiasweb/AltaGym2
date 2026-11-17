import type { NextRequest } from 'next/server';
import {
  assertRequestedClientId,
  privateJson,
  readJsonObject,
  withAuthenticatedClient,
} from '../../../../../lib/client-api';
import { confirmGroupBooking } from '../../../../../lib/group-bookings';

type RouteContext = { params: Promise<{ groupSessionId: string }> };

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, { params }: RouteContext) {
  return withAuthenticatedClient(request, async (context) => {
    const body = await readJsonObject(request);
    assertRequestedClientId(context, body.clientId);
    const { groupSessionId } = await params;
    const result = await confirmGroupBooking(context, groupSessionId);
    return privateJson({ booking: result.booking }, result.created ? 201 : 200);
  });
}
