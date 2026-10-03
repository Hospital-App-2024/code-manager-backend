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

const readMigration = (name: string) =>
  readFileSync(
    resolve(process.cwd(), 'prisma/migrations', name, 'migration.sql'),
    'utf8',
  );

const NEW_INIT_MIGRATION = '20260711143243_new_init';
const TEAMS_MIGRATION =
  '20261003120000_blue_teams_cogrid_time_closure_operator';

describe('emergency-code migrations', () => {
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

    await client.query(readMigration(NEW_INIT_MIGRATION));
  });

  afterAll(async () => {
    await client?.end();
  });

  describe('legacy tables to EmergencyCode (new_init)', () => {
    it('preserves all IDs and maps the operational activation time', async () => {
      const result = await client.query<{
        id: string;
        activationTime: string;
      }>(`
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
      expect(
        result.rows.find(({ id }) => id === 'green-1')?.activationTime,
      ).toBe('2026-08-24 10:00:00');
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

  describe('blue teams, COGRID time and closure operator', () => {
    const insertEmergency = (id: string, columns: string, values: string) =>
      client.query(`
        INSERT INTO "EmergencyCode"
          ("id", "type", "activeBy", "updatedAt", "activationTime", "location", "operatorId", ${columns})
        VALUES ('${id}', ${values})
      `);

    const columnNames = async () => {
      const result = await client.query<{ column_name: string }>(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'EmergencyCode'
      `);
      return result.rows.map(({ column_name }) => column_name);
    };

    beforeAll(async () => {
      await client.query(`
        INSERT INTO "Operator" ("id", "name", "updatedAt")
        VALUES ('operator-2', 'Operador Dos', now());
      `);

      // Variantes de texto libre que permitía la interfaz anterior.
      await insertEmergency(
        'blue-urgencia',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:00:00', 'Urgencias', 'operator-1', 'Equipo urgencia'`,
      );
      await insertEmergency(
        'blue-pediatric',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:01:00', 'Pediatría', 'operator-1', 'Equipo UCI pediatrica'`,
      );
      await insertEmergency(
        'blue-accent',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:02:00', 'Pediatría', 'operator-1', '  EQUIPO  UCI PEDIÁTRICA '`,
      );

      // Un verde abierto y uno ya cerrado con el modelo anterior (isClosed).
      await insertEmergency(
        'green-open',
        '"event", "police", "isClosed"',
        `'GREEN', 'Central', now(), '2026-08-24 12:00:00', 'Urgencias', 'operator-1', 'Riña', true, false`,
      );
      await client.query(`
        UPDATE "EmergencyCode"
        SET "isClosed" = true, "closedBy" = 'Dra. Pérez', "closedAt" = '2026-08-24 10:30:00'
        WHERE id = 'green-1'
      `);
    });

    it('aborts without changing anything when a team cannot be mapped', async () => {
      await insertEmergency(
        'blue-unmapped',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:03:00', 'Oncología', 'operator-1', 'Equipo Oncología'`,
      );

      await expect(
        client.query(readMigration(TEAMS_MIGRATION)),
      ).rejects.toThrow(/Equipo Oncología/);

      const columns = await columnNames();
      expect(columns).toEqual(
        expect.arrayContaining(['team', 'isClosed', 'COGRID']),
      );
      expect(columns).not.toContain('teams');
      const enumType = await client.query(
        `SELECT to_regtype('"BlueTeam"') AS t`,
      );
      expect(enumType.rows[0].t).toBeNull();

      await client.query(
        `DELETE FROM "EmergencyCode" WHERE id = 'blue-unmapped'`,
      );
    });

    describe('once every team can be mapped', () => {
      beforeAll(async () => {
        await client.query(readMigration(TEAMS_MIGRATION));
      });

      it('keeps every emergency', async () => {
        const result = await client.query<{ id: string }>(
          `SELECT id FROM "EmergencyCode" ORDER BY id`,
        );

        expect(result.rows.map(({ id }) => id)).toEqual([
          'air-1',
          'blue-1',
          'blue-accent',
          'blue-pediatric',
          'blue-urgencia',
          'green-1',
          'green-open',
          'leak-1',
          'red-1',
        ]);
      });

      it('maps the free-text team to the BlueTeam enum', async () => {
        const result = await client.query<{ id: string; teams: string[] }>(`
          SELECT id, "teams"::text[] AS teams
          FROM "EmergencyCode" WHERE "type" = 'BLUE' ORDER BY id
        `);

        expect(result.rows).toEqual([
          { id: 'blue-1', teams: ['ICU'] },
          { id: 'blue-accent', teams: ['PEDIATRIC_ICU'] },
          { id: 'blue-pediatric', teams: ['PEDIATRIC_ICU'] },
          { id: 'blue-urgencia', teams: ['EMERGENCY'] },
        ]);
      });

      it('leaves non-blue emergencies with an empty team list', async () => {
        const result = await client.query<{ withTeams: string }>(`
          SELECT COUNT(*) AS "withTeams" FROM "EmergencyCode"
          WHERE "type" <> 'BLUE' AND cardinality("teams") > 0
        `);

        expect(Number(result.rows[0].withTeams)).toBe(0);
      });

      it('drops the replaced columns and adds the new ones', async () => {
        const columns = await columnNames();

        expect(columns).not.toContain('team');
        expect(columns).not.toContain('isClosed');
        expect(columns).not.toContain('COGRID');
        expect(columns).toEqual(
          expect.arrayContaining([
            'teams',
            'cogridNotified',
            'cogridNotifiedAt',
            'closedByOperatorId',
          ]),
        );
      });

      it('carries COGRID over and leaves its time empty', async () => {
        const result = await client.query(
          `SELECT "cogridNotified", "cogridNotifiedAt" FROM "EmergencyCode" WHERE id = 'red-1'`,
        );

        expect(result.rows[0]).toEqual({
          cogridNotified: true,
          cogridNotifiedAt: null,
        });
      });

      it('keeps legacy closures without a closing operator and open codes open', async () => {
        const result = await client.query(`
          SELECT id, "closedBy", "closedAt"::text AS "closedAt", "closedByOperatorId"
          FROM "EmergencyCode" WHERE id IN ('green-1', 'green-open') ORDER BY id
        `);

        expect(result.rows).toEqual([
          {
            id: 'green-1',
            closedBy: 'Dra. Pérez',
            closedAt: '2026-08-24 10:30:00',
            closedByOperatorId: null,
          },
          {
            id: 'green-open',
            closedBy: null,
            closedAt: null,
            closedByOperatorId: null,
          },
        ]);
      });

      it('rejects a blue emergency without teams', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode" SET "teams" = ARRAY[]::"BlueTeam"[] WHERE id = 'blue-1'
          `),
        ).rejects.toMatchObject({
          constraint: 'EmergencyCode_type_fields_check',
        });
      });

      it('rejects teams on a non-blue emergency', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode" SET "teams" = ARRAY['ICU']::"BlueTeam"[] WHERE id = 'leak-1'
          `),
        ).rejects.toMatchObject({
          constraint: 'EmergencyCode_type_fields_check',
        });
      });

      it('only accepts a COGRID time when COGRID was notified', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode"
            SET "cogridNotified" = false, "cogridNotifiedAt" = '2026-08-24 10:10:00'
            WHERE id = 'red-1'
          `),
        ).rejects.toMatchObject({
          constraint: 'EmergencyCode_type_fields_check',
        });

        await expect(
          client.query(`
            UPDATE "EmergencyCode"
            SET "cogridNotifiedAt" = '2026-08-24 10:10:00' WHERE id = 'red-1'
          `),
        ).resolves.toBeDefined();
      });

      it('rejects closure data on a non-green emergency', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode"
            SET "closedBy" = 'Supervisor', "closedAt" = '2026-08-24 13:00:00'
            WHERE id = 'blue-1'
          `),
        ).rejects.toMatchObject({ constraint: 'EmergencyCode_closure_check' });
      });

      it('rejects a closure that is incomplete or earlier than activation', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode" SET "closedByOperatorId" = 'operator-2'
            WHERE id = 'green-open'
          `),
        ).rejects.toMatchObject({ constraint: 'EmergencyCode_closure_check' });

        await expect(
          client.query(`
            UPDATE "EmergencyCode"
            SET "closedBy" = 'Dra. Pérez', "closedAt" = '2026-08-24 09:00:00',
                "closedByOperatorId" = 'operator-2'
            WHERE id = 'green-open'
          `),
        ).rejects.toMatchObject({ constraint: 'EmergencyCode_closure_check' });
      });

      it('requires an existing operator to register a closure', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode"
            SET "closedBy" = 'Dra. Pérez', "closedAt" = '2026-08-24 13:00:00',
                "closedByOperatorId" = 'ghost-operator'
            WHERE id = 'green-open'
          `),
        ).rejects.toMatchObject({
          constraint: 'EmergencyCode_closedByOperatorId_fkey',
        });
      });

      it('closes a green emergency and then protects the closing operator', async () => {
        await client.query(`
          UPDATE "EmergencyCode"
          SET "closedBy" = 'Dra. Pérez', "closedAt" = '2026-08-24 13:00:00',
              "closedByOperatorId" = 'operator-2'
          WHERE id = 'green-open'
        `);

        await expect(
          client.query(`DELETE FROM "Operator" WHERE id = 'operator-2'`),
        ).rejects.toMatchObject({
          constraint: 'EmergencyCode_closedByOperatorId_fkey',
        });
      });
    });
  });
});
