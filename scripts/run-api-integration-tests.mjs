import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Set TEST_DATABASE_URL to an isolated PostgreSQL test database.');
}

const parsedUrl = new URL(databaseUrl);
if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
  throw new Error('TEST_DATABASE_URL must use PostgreSQL.');
}

const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1)).toLowerCase();
const hasTestMarker = [parsedUrl.hostname.toLowerCase(), databaseName].some((value) =>
  /(?:^|[._-])test(?:$|[._-])/.test(value),
);
if (!hasTestMarker) {
  throw new Error(
    'Identify the isolated test database with a test token in its host or database name.',
  );
}

if (process.env.PRODUCTION_DATABASE_URL) {
  const productionUrl = new URL(process.env.PRODUCTION_DATABASE_URL);
  if (
    parsedUrl.hostname === productionUrl.hostname &&
    parsedUrl.pathname === productionUrl.pathname &&
    parsedUrl.port === productionUrl.port
  ) {
    throw new Error('The production database cannot be used for integration tests.');
  }
}

const environment = { ...process.env, DATABASE_URL: databaseUrl };
const packageManager = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

for (const arguments_ of [
  ['exec', 'prisma', 'migrate', 'deploy'],
  ['exec', 'vitest', 'run', 'apps/api/integration-tests'],
]) {
  const result = spawnSync(packageManager, arguments_, {
    env: environment,
    shell: process.platform === 'win32',
    stdio: 'inherit',
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
