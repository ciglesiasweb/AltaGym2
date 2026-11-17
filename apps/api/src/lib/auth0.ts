import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.APP_BASE_URL,
  authorizationParameters: {
    scope: 'openid profile email',
  },
  enableAccessTokenEndpoint: false,
  routes: {
    login: '/auth/login',
    callback: '/auth/callback',
    logout: '/auth/logout',
    profile: '/auth/profile',
  },
  session: {
    rolling: true,
    inactivityDuration: 8 * 60 * 60,
    cookie: {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
});
