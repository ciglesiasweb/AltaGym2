import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from './lib/auth0';
import { applyCors, enforceRequestOrigin } from './lib/request-security';

export async function proxy(request: NextRequest) {
  const isApiRequest = request.nextUrl.pathname.startsWith('/api/');
  const isPreflight = request.method === 'OPTIONS';

  if (isApiRequest && isPreflight) {
    const rejected = enforceRequestOrigin(request);

    if (rejected) {
      return rejected;
    }

    return applyCors(new NextResponse(null, { status: 204 }), request.headers.get('origin'));
  }

  const rejected = isApiRequest ? enforceRequestOrigin(request) : undefined;

  if (rejected) {
    return isApiRequest
      ? applyCors(rejected, request.headers.get('origin'))
      : rejected;
  }

  const response = await auth0.middleware(request);

  return isApiRequest
    ? applyCors(response, request.headers.get('origin'))
    : response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};
