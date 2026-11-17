import { spawnSync } from 'node:child_process';

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Set TEST_DATABASE_URL to an isolated PostgreSQL test database.');
}
const isolationConfirmed = process.env.CONFIRM_TEST_DATABASE_ISOLATED === 'true';

const parsedUrl = new URL(databaseUrl);
if (!['postgres:', 'postgresql:'].includes(parsedUrl.protocol)) {
  throw new Error('TEST_DATABASE_URL must use PostgreSQL.');
}

function sameDatabaseTarget(candidate) {
  const otherUrl = new URL(candidate);
  if (
    parsedUrl.hostname === otherUrl.hostname &&
    parsedUrl.pathname === otherUrl.pathname &&
    parsedUrl.port === otherUrl.port
  ) {
    return true;
  }
  return false;
}

if (
  process.env.DATABASE_URL &&
  sameDatabaseTarget(process.env.DATABASE_URL) &&
  !isolationConfirmed
) {
  throw new Error('TEST_DATABASE_URL must target an isolated database, not DATABASE_URL.');
}

if (
  process.env.PRODUCTION_DATABASE_URL &&
  sameDatabaseTarget(process.env.PRODUCTION_DATABASE_URL)
) {
  throw new Error('The production database cannot be used for integration tests.');
}

const databaseName = decodeURIComponent(parsedUrl.pathname.slice(1)).toLowerCase();
const hasTestMarker = [parsedUrl.hostname.toLowerCase(), databaseName].some((value) =>
  /(?:^|[._-])test(?:$|[._-])/.test(value),
);
if (!hasTestMarker && !isolationConfirmed) {
  throw new Error(
    'Identify the test database with a test token or set CONFIRM_TEST_DATABASE_ISOLATED=true.',
  );
}

const environment = { ...process.env, DATABASE_URL: databaseUrl };
const packageManager = process.platform === 'win32' ? 'pnpm.exe' : 'pnpm';

const migrationStatus = spawnSync(
  packageManager,
  ['exec', 'prisma', 'migrate', 'status'],
  { env: environment, encoding: 'utf8' },
);
if (migrationStatus.error) {
  throw migrationStatus.error;
}
process.stdout.write(migrationStatus.stdout ?? '');
process.stderr.write(migrationStatus.stderr ?? '');

if (migrationStatus.status !== 0) {
  const migration = spawnSync(
    packageManager,
    ['exec', 'prisma', 'migrate', 'deploy'],
    { env: environment, stdio: 'inherit' },
  );
  if (migration.error) {
    throw migration.error;
  }
  if (migration.status !== 0) {
    process.exit(migration.status ?? 1);
  }
}

const tests = spawnSync(
  packageManager,
  ['exec', 'vitest', 'run', 'apps/api/integration-tests'],
  { env: environment, stdio: 'inherit' },
);
if (tests.error) {
  throw tests.error;
}
if (tests.status !== 0) {
  process.exit(tests.status ?? 1);
}
