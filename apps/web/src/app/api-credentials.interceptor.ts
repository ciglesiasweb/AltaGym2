import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const location = inject(DOCUMENT).defaultView?.location;
  const apiOrigin = (globalThis as typeof globalThis & {
    __ALTAGYM_API_ORIGIN__?: string;
  }).__ALTAGYM_API_ORIGIN__;
  let configuredOrigin: string | undefined;
  let apiUrl: URL | undefined;

  try {
    const configuredUrl = apiOrigin ? new URL(apiOrigin) : undefined;
    if (
      configuredUrl &&
      ['http:', 'https:'].includes(configuredUrl.protocol) &&
      !configuredUrl.username &&
      !configuredUrl.password &&
      configuredUrl.pathname === '/' &&
      !configuredUrl.search &&
      !configuredUrl.hash
    ) {
      configuredOrigin = configuredUrl.origin;
    }
  } catch {
    // Ignore invalid configured origins.
  }

  try {
    const url = new URL(request.url, location?.href ?? 'http://localhost');
    const sameOrigin = location
      ? url.origin === location.origin
      : request.url.startsWith('/') &&
        !request.url.startsWith('//') &&
        url.origin === 'http://localhost';

    if (
      (sameOrigin || (configuredOrigin && url.origin === configuredOrigin)) &&
      (url.pathname === '/api' || url.pathname.startsWith('/api/'))
    ) {
      apiUrl = url;
    }
  } catch {
    // Invalid URLs must not receive API credentials.
  }

  const outgoingRequest = apiUrl
    ? request.clone({ withCredentials: true })
    : request;

  return next(outgoingRequest).pipe(
    catchError((error: unknown) => {
      if (
        apiUrl &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        location
      ) {
        const path = `${location.pathname}${location.search}${location.hash}`;
        const returnTo =
          path.startsWith('/') && !path.startsWith('//') && !path.includes('\\')
            ? path
            : '/';

        location.assign(
          `${apiUrl.origin}/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
        );
      }

      return throwError(() => error);
    }),
  );
};
