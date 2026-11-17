import { NextResponse } from 'next/server';

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function configuredWebOrigin(): string {
  const origin = process.env.WEB_ORIGIN;

  if (!origin) {
    throw new Error('WEB_ORIGIN must be configured');
  }

  return new URL(origin).origin;
}

export function applyCors(response: NextResponse, origin: string | null) {
  const allowedOrigin = configuredWebOrigin();

  if (origin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-XSRF-TOKEN');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.headers.set('Vary', 'Origin');
  }

  return response;
}

export function enforceRequestOrigin(request: Request): NextResponse | undefined {
  const origin = request.headers.get('origin');
  const allowedOrigin = configuredWebOrigin();

  if (origin && origin !== allowedOrigin) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  if (mutationMethods.has(request.method) && origin !== allowedOrigin) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  }

  return undefined;
}
