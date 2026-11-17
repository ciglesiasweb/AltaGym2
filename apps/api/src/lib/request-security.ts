import { NextResponse } from 'next/server';

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function configuredWebOrigin(): string {
  const origin = process.env.WEB_ORIGIN;

  if (!origin) {
    throw new Error('WEB_ORIGIN must be configured');
  }

  const parsedOrigin = new URL(origin);

  if (
    !['http:', 'https:'].includes(parsedOrigin.protocol) ||
    parsedOrigin.username ||
    parsedOrigin.password ||
    parsedOrigin.hostname.includes('*')
  ) {
    throw new Error('WEB_ORIGIN must be a concrete HTTP(S) origin');
  }

  return parsedOrigin.origin;
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
    return unauthorizedResponse();
  }

  if (mutationMethods.has(request.method) && origin !== allowedOrigin) {
    return unauthorizedResponse();
  }

  return undefined;
}

function unauthorizedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'UNAUTHORIZED' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } },
  );
}
