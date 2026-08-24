import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Client } from 'pg';

const databaseUrl = process.env.MIGRATION_TEST_DATABASE_URL;

function requireSafeTestDatabaseUrl(): string {
  if (!databaseUrl) {
    throw new Error('MIGRATION_TEST_DATABASE_URL is required');
  }

  const databaseName = new URL(databaseUrl).pathname.slice(1);
  if (!databaseName.endsWith('_migration_test')) {
    throw new Error(
      'Migration tests require a database ending in _migration_test',
    );
  }

  return databaseUrl;
}

describe('legacy emergency-code migration', () => {
  let client: Client;

  beforeAll(async () => {
    client = new Client({ connectionString: requireSafeTestDatabaseUrl() });
    await client.connect();
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
    await client.query(`
      CREATE TYPE "Role" AS ENUM ('User', 'Admin', 'Operator');
      CREATE TABLE "User" (
        "id" TEXT PRIMARY KEY, "email" TEXT UNIQUE NOT NULL, "name" TEXT,
        "password" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL, "role" "Role" NOT NULL DEFAULT 'User',
        "isActive" BOOLEAN NOT NULL DEFAULT false
      );
      CREATE TABLE "Operator" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL);
      CREATE TABLE "CodeGreen" (
        "id" TEXT PRIMARY KEY, "activeBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL,
        "location" TEXT NOT NULL, "event" TEXT NOT NULL, "operatorId" TEXT NOT NULL,
        "police" BOOLEAN NOT NULL,
        FOREIGN KEY ("operatorId") REFERENCES "Operator"("id")
      );
    `);

    await client.query(`
      CREATE TABLE "CodeBlue" (
        "id" TEXT PRIMARY KEY, "activeBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL,
        "location" TEXT NOT NULL, "team" TEXT NOT NULL, "operatorId" TEXT NOT NULL REFERENCES "Operator"("id")
      );
      CREATE TABLE "CodeAir" (
        "id" TEXT PRIMARY KEY, "activeBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL,
        "emergencyDetail" TEXT NOT NULL, "location" TEXT NOT NULL,
        "operatorId" TEXT NOT NULL REFERENCES "Operator"("id")
      );
      CREATE TABLE "CodeRed" (
        "id" TEXT PRIMARY KEY, "createdAt" TIMESTAMP(3) NOT NULL, "activeBy" TEXT NOT NULL,
        "operatorId" TEXT NOT NULL REFERENCES "Operator"("id"), "location" TEXT NOT NULL,
        "COGRID" BOOLEAN NOT NULL, "firefighterCalledTime" TIMESTAMP(3)
      );
      CREATE TABLE "CodeLeak" (
        "id" TEXT PRIMARY KEY, "activeBy" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL,
        "location" TEXT NOT NULL, "operatorId" TEXT NOT NULL REFERENCES "Operator"("id"),
        "patientDescription" TEXT NOT NULL
      );

      INSERT INTO "Operator" (id, name) VALUES ('operator-1', 'Operador Uno');
      INSERT INTO "CodeGreen" VALUES ('green-1', 'Central', '2026-08-24 10:00:00', 'Urgencias', 'Incidente', 'operator-1', false);
      INSERT INTO "CodeBlue" VALUES ('blue-1', 'Central', '2026-08-24 10:01:00', 'UCI', 'Equipo UCI', 'operator-1');
      INSERT INTO "CodeAir" VALUES ('air-1', 'Central', '2026-08-24 10:02:00', 'Helicóptero', 'Helipuerto', 'operator-1');
      INSERT INTO "CodeRed" VALUES ('red-1', '2026-08-24 10:03:00', 'Central', 'operator-1', 'Bodega', true, NULL);
      INSERT INTO "CodeLeak" VALUES ('leak-1', 'Central', '2026-08-24 10:04:00', 'Urgencias', 'operator-1', 'Vestimenta azul');
    `);

    const migration = readFileSync(
      resolve(
        process.cwd(),
        'prisma/migrations/20260711143243_new_init/migration.sql',
      ),
      'utf8',
    );
    await client.query(migration);
  });

  afterAll(async () => {
    await client?.end();
  });

  it('preserves all IDs and maps the operational activation time', async () => {
    const result = await client.query<{ id: string; activationTime: string }>(`
      SELECT id, "activationTime"::text AS "activationTime"
      FROM "EmergencyCode" ORDER BY id
    `);

    expect(result.rows).toHaveLength(5);
    expect(result.rows.map(({ id }) => id)).toEqual([
      'air-1',
      'blue-1',
      'green-1',
      'leak-1',
      'red-1',
    ]);
    expect(result.rows.find(({ id }) => id === 'green-1')?.activationTime).toBe(
      '2026-08-24 10:00:00',
    );
  });

  it('retains every source table under its legacy name', async () => {
    const result = await client.query<{ legacyCount: string }>(`
      SELECT COUNT(*) AS "legacyCount"
      FROM pg_class
      WHERE relname IN (
        'CodeGreen_legacy_20260824', 'CodeBlue_legacy_20260824',
        'CodeAir_legacy_20260824', 'CodeRed_legacy_20260824',
        'CodeLeak_legacy_20260824'
      )
    `);

    expect(Number(result.rows[0].legacyCount)).toBe(5);
  });

  it('rejects closure state for a non-green emergency', async () => {
    await expect(
      client.query(`
        UPDATE "EmergencyCode"
        SET "isClosed" = false
        WHERE id = 'blue-1'
      `),
    ).rejects.toMatchObject({ constraint: 'EmergencyCode_closure_check' });
  });
});
