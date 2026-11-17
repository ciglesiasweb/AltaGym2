import { DOCUMENT } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { apiCredentialsInterceptor } from './api-credentials.interceptor';

describe('apiCredentialsInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let location: {
    href: string;
    origin: string;
    pathname: string;
    search: string;
    hash: string;
    assign: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    location = {
      href: 'https://web.example/reservas?fecha=hoy#detalle',
      origin: 'https://web.example',
      pathname: '/reservas',
      search: '?fecha=hoy',
      hash: '#detalle',
      assign: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: { location }, cookie: '' } },
        provideHttpClient(withInterceptors([apiCredentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    vi.unstubAllGlobals();
  });

  it('sends credentials to relative and absolute same-origin API URLs', () => {
    for (const url of ['/api', '/api/reservas?fecha=hoy', 'https://web.example/api/reservas']) {
      http.get(url).subscribe();
      const request = backend.expectOne(url);
      expect(request.request.withCredentials).toBe(true);
      request.flush({});
    }
  });

  it('also recognizes the configured API origin without trusting lookalike origins or paths', () => {
    vi.stubGlobal('__ALTAGYM_API_ORIGIN__', 'https://api.example/');
    for (const url of ['https://api.example/api/reservas', '/api/reservas']) {
      http.get(url).subscribe();
      const request = backend.expectOne(url);
      expect(request.request.withCredentials).toBe(true);
      request.flush({});
    }

    for (const url of [
      'https://api.example.evil.test/api/reservas',
      'https://other.example/api/reservas',
      'https://api.example/apiary',
      '/api/../public',
    ]) {
      http.get(url).subscribe();
      const request = backend.expectOne(url);
      expect(request.request.withCredentials).toBe(false);
      request.flush({});
    }
  });

  it('preserves explicit credentials and other options for non-API requests', () => {
    http.get('/assets/config.json', {
      withCredentials: true,
      headers: { 'X-Test': 'value' },
    }).subscribe();
    const request = backend.expectOne('/assets/config.json');
    expect(request.request.withCredentials).toBe(true);
    expect(request.request.headers.get('X-Test')).toBe('value');
    request.flush({});
  });

  it('redirects a same-origin API 401 to login with the internal return path and propagates the error', () => {
    let received: HttpErrorResponse | undefined;
    http.get('/api/reservas').subscribe({ error: (error) => { received = error; } });
    backend.expectOne('/api/reservas').flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(location.assign).toHaveBeenCalledOnce();
    const login = new URL(location.assign.mock.calls[0][0] as string);
    expect(login.origin).toBe('https://web.example');
    expect(login.pathname).toBe('/auth/login');
    expect(login.searchParams.get('returnTo')).toBe('/reservas?fecha=hoy#detalle');
    expect(received?.status).toBe(401);
  });

  it('redirects a configured-origin API 401 without retrying the mutation', () => {
    vi.stubGlobal('__ALTAGYM_API_ORIGIN__', 'https://api.example');
    let received: HttpErrorResponse | undefined;
    http.post('https://api.example/api/reservas', { actividad: 1 })
      .subscribe({ error: (error) => { received = error; } });
    const request = backend.expectOne('https://api.example/api/reservas');
    expect(request.request.withCredentials).toBe(true);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    const login = new URL(location.assign.mock.calls[0][0] as string);
    expect(login.origin).toBe('https://api.example');
    expect(login.searchParams.get('returnTo')).toBe('/reservas?fecha=hoy#detalle');
    expect(received?.status).toBe(401);
    backend.expectNone('https://api.example/api/reservas');
  });

  it('does not send an external-looking return path to login', () => {
    location.pathname = '//evil.example';
    http.get('/api/reservas').subscribe({ error: () => undefined });
    backend.expectOne('/api/reservas').flush({}, { status: 401, statusText: 'Unauthorized' });
    const login = new URL(location.assign.mock.calls[0][0] as string);
    expect(login.searchParams.get('returnTo')).toBe('/');
  });

  it('does not redirect for non-API 401 or API 403 and other errors', () => {
    for (const [url, status] of [
      ['/assets/config.json', 401],
      ['https://other.example/api/reservas', 401],
      ['/api/reservas', 403],
      ['/api/reservas', 400],
      ['/api/reservas', 500],
    ] as const) {
      let received: HttpErrorResponse | undefined;
      http.get(url).subscribe({ error: (error) => { received = error; } });
      backend.expectOne(url).flush({}, { status, statusText: 'Error' });
      expect(received?.status).toBe(status);
    }
    expect(location.assign).not.toHaveBeenCalled();
  });

  it('ignores malformed configured origins without disabling same-origin API requests', () => {
    vi.stubGlobal('__ALTAGYM_API_ORIGIN__', 'not an origin');
    http.get('/api/reservas').subscribe();
    const request = backend.expectOne('/api/reservas');
    expect(request.request.withCredentials).toBe(true);
    request.flush({});
  });

  it('handles server-side requests without a browser location', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: null, cookie: '' } },
        provideHttpClient(withInterceptors([apiCredentialsInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);

    http.get('/api/reservas').subscribe({ error: () => undefined });
    const request = backend.expectOne('/api/reservas');
    expect(request.request.withCredentials).toBe(true);
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    http.get('/\\other.example/api/reservas').subscribe();
    const external = backend.expectOne('/\\other.example/api/reservas');
    expect(external.request.withCredentials).toBe(false);
    external.flush({});
  });
});
