import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const apiOrigin =
  (globalThis as typeof globalThis & { __ALTAGYM_API_ORIGIN__?: string })
    .__ALTAGYM_API_ORIGIN__ ?? '';

export const apiCredentialsInterceptor: HttpInterceptorFn = (request, next) => {
  const isApiRequest = apiOrigin
    ? request.url.startsWith(`${apiOrigin}/api/`)
    : request.url.startsWith('/api/');

  const outgoingRequest = isApiRequest
    ? request.clone({ withCredentials: true })
    : request;

  return next(outgoingRequest).pipe(
    catchError((error: unknown) => {
      if (
        isApiRequest &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        typeof window !== 'undefined'
      ) {
        const returnTo = `${window.location.pathname}${window.location.search}`;
        const loginOrigin = apiOrigin || window.location.origin;

        window.location.assign(
          `${loginOrigin}/auth/login?returnTo=${encodeURIComponent(returnTo)}`,
        );
      }

      return throwError(() => error);
    }),
  );
};
