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

// El esquema antiguo se construye con las migraciones reales, no con tablas
// escritas a mano: así las pruebas ven las mismas columnas que producción.
const LEGACY_MIGRATIONS = [
  '20240627210926_init',
  '20260201134327_add_patient_name_to_leak',
];
const NEW_INIT_MIGRATION = '20260711143243_new_init';
const TEAMS_MIGRATION =
  '20261003120000_blue_teams_cogrid_time_closure_operator';

describe('emergency-code migrations', () => {
  let client: Client;

  const emergencyIds = async () => {
    const result = await client.query<{ id: string }>(
      `SELECT id FROM "EmergencyCode"`,
    );
    return result.rows.map(({ id }) => id).sort();
  };

  const columnNames = async () => {
    const result = await client.query<{ column_name: string }>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'EmergencyCode'
    `);
    return result.rows.map(({ column_name }) => column_name);
  };

  beforeAll(async () => {
    client = new Client({ connectionString: requireSafeTestDatabaseUrl() });
    await client.connect();
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    for (const migration of LEGACY_MIGRATIONS) {
      await client.query(readMigration(migration));
    }

    await client.query(`
      INSERT INTO "Operator" ("id", "name") VALUES ('operator-1', 'Operador Uno');

      INSERT INTO "CodeGreen"
        ("id", "activeBy", "createdAt", "location", "event", "operatorId", "police",
         "observations", "isClosed", "closedBy", "closedAt")
      VALUES
        ('green-open', 'Central', '2026-08-24 12:00:00', 'Urgencias', 'Riña', 'operator-1', true,
         'Se avisó a guardia', false, NULL, NULL),
        ('green-closed', 'Central', '2026-08-24 10:00:00', 'Urgencias', 'Incidente', 'operator-1', false,
         NULL, true, 'Dra. Pérez', '2026-08-24 10:30:00'),
        -- Cierre antiguo con la bandera sin actualizar: conserva todos sus datos de cierre.
        ('green-stale-flag', 'Central', '2026-08-24 11:00:00', 'Urgencias', 'Hurto', 'operator-1', false,
         NULL, false, 'Dr. Rojas', '2026-08-24 11:20:00'),
        -- Datos de cierre a medias en un código abierto: se descartan.
        ('green-partial', 'Central', '2026-08-24 11:30:00', 'Urgencias', 'Agresión', 'operator-1', false,
         NULL, false, 'Solo nombre', NULL),
        -- Marcado como cerrado sin datos de cierre: bloquea la migración hasta repararlo.
        ('green-incomplete', 'Central', '2026-08-24 09:00:00', 'Urgencias', 'Riña', 'operator-1', false,
         NULL, true, NULL, NULL);

      INSERT INTO "CodeBlue"
        ("id", "activeBy", "createdAt", "location", "team", "operatorId", "observations")
      VALUES
        ('blue-urgencia', 'Central', '2026-08-24 10:01:00', 'Urgencias', 'urgencia', 'operator-1', 'Paro presenciado'),
        ('blue-uci', 'Central', '2026-08-24 10:02:00', 'UCI', 'uci', 'operator-1', NULL),
        ('blue-pediatric', 'Central', '2026-08-24 10:03:00', 'Pediatría', 'uci pediátrica', 'operator-1', NULL);

      INSERT INTO "CodeAir"
        ("id", "activeBy", "createdAt", "emergencyDetail", "location", "operatorId", "observations")
      VALUES
        ('air-1', 'Central', '2026-08-24 10:04:00', 'Helicóptero', 'Helipuerto', 'operator-1', 'Aterrizaje en curso');

      INSERT INTO "CodeRed"
        ("id", "createdAt", "activeBy", "operatorId", "location", "COGRID", "firefighterCalledTime", "observations")
      VALUES
        ('red-1', '2026-08-24 10:05:00', 'Central', 'operator-1', 'Bodega', true, '2026-08-24 10:08:00', NULL);

      INSERT INTO "CodeLeak"
        ("id", "activeBy", "createdAt", "location", "operatorId", "patientDescription", "observations", "patientName")
      VALUES
        ('leak-1', 'Central', '2026-08-24 10:06:00', 'Urgencias', 'operator-1', 'Vestimenta azul', 'Visto en el pasillo', 'Paciente Prueba');
    `);
  });

  afterAll(async () => {
    await client?.end();
  });

  describe('legacy tables to EmergencyCode (new_init)', () => {
    it('aborts before copying anything when a closed green lacks its closure data', async () => {
      await expect(
        client.query(readMigration(NEW_INIT_MIGRATION)),
      ).rejects.toThrow(/closed CodeGreen rows without a complete closure/);
      // La migración abre su propia transacción: se descarta como lo haría el cierre de la conexión.
      await client.query('ROLLBACK');

      const created = await client.query(
        `SELECT to_regclass('"EmergencyCode"') AS t`,
      );
      expect(created.rows[0].t).toBeNull();

      // Reparación manual del dato de origen.
      await client.query(`
        UPDATE "CodeGreen"
        SET "closedBy" = 'Jefe de turno', "closedAt" = '2026-08-24 13:00:00'
        WHERE id = 'green-incomplete'
      `);
    });

    describe('once the legacy data is consistent', () => {
      beforeAll(async () => {
        await client.query(readMigration(NEW_INIT_MIGRATION));
      });

      it('preserves all IDs and maps the operational activation time', async () => {
        const result = await client.query<{
          id: string;
          activationTime: string;
        }>(`
          SELECT id, "activationTime"::text AS "activationTime"
          FROM "EmergencyCode"
        `);

        expect(result.rows.map(({ id }) => id).sort()).toEqual([
          'air-1',
          'blue-pediatric',
          'blue-uci',
          'blue-urgencia',
          'green-closed',
          'green-incomplete',
          'green-open',
          'green-partial',
          'green-stale-flag',
          'leak-1',
          'red-1',
        ]);
        expect(
          result.rows.find(({ id }) => id === 'green-closed')?.activationTime,
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

      it('carries over observations, the patient name and the firefighter time', async () => {
        const result = await client.query(`
          SELECT id, "observations", "patientName", "firefighterCalledTime"::text AS "firefighterCalledTime"
          FROM "EmergencyCode"
          WHERE id IN ('green-open', 'blue-urgencia', 'air-1', 'leak-1', 'red-1', 'blue-uci')
        `);
        const byId = Object.fromEntries(
          result.rows.map((row) => [row.id, row]),
        );

        expect(byId['green-open'].observations).toBe('Se avisó a guardia');
        expect(byId['blue-urgencia'].observations).toBe('Paro presenciado');
        expect(byId['air-1'].observations).toBe('Aterrizaje en curso');
        expect(byId['leak-1'].observations).toBe('Visto en el pasillo');
        expect(byId['leak-1'].patientName).toBe('Paciente Prueba');
        expect(byId['red-1'].firefighterCalledTime).toBe('2026-08-24 10:08:00');
        expect(byId['blue-uci'].observations).toBeNull();
      });

      it('keeps the closure of green codes instead of reopening them', async () => {
        const result = await client.query(`
          SELECT id, "isClosed", "closedBy", "closedAt"::text AS "closedAt"
          FROM "EmergencyCode" WHERE "type" = 'GREEN'
        `);
        const byId = Object.fromEntries(
          result.rows.map((row) => [row.id, row]),
        );

        expect(byId['green-closed']).toMatchObject({
          isClosed: true,
          closedBy: 'Dra. Pérez',
          closedAt: '2026-08-24 10:30:00',
        });
        expect(byId['green-incomplete']).toMatchObject({
          isClosed: true,
          closedBy: 'Jefe de turno',
          closedAt: '2026-08-24 13:00:00',
        });
        expect(byId['green-open']).toMatchObject({
          isClosed: false,
          closedBy: null,
          closedAt: null,
        });
      });

      it('treats a complete closure with a stale flag as closed and drops half-filled closure data', async () => {
        const result = await client.query(`
          SELECT id, "isClosed", "closedBy", "closedAt"::text AS "closedAt"
          FROM "EmergencyCode" WHERE id IN ('green-stale-flag', 'green-partial')
        `);
        const byId = Object.fromEntries(
          result.rows.map((row) => [row.id, row]),
        );

        expect(byId['green-stale-flag']).toMatchObject({
          isClosed: true,
          closedBy: 'Dr. Rojas',
          closedAt: '2026-08-24 11:20:00',
        });
        expect(byId['green-partial']).toMatchObject({
          isClosed: false,
          closedBy: null,
          closedAt: null,
        });
      });

      it('rejects closure state for a non-green emergency', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode"
            SET "isClosed" = false
            WHERE id = 'blue-uci'
          `),
        ).rejects.toMatchObject({ constraint: 'EmergencyCode_closure_check' });
      });
    });
  });

  describe('blue teams, COGRID time and closure operator', () => {
    const insertEmergency = (id: string, columns: string, values: string) =>
      client.query(`
        INSERT INTO "EmergencyCode"
          ("id", "type", "activeBy", "updatedAt", "activationTime", "location", "operatorId", ${columns})
        VALUES ('${id}', ${values})
      `);

    let idsBefore: string[];

    beforeAll(async () => {
      await client.query(`
        INSERT INTO "Operator" ("id", "name", "updatedAt")
        VALUES ('operator-2', 'Operador Dos', now());
      `);

      // Variantes de texto libre que podía escribir la interfaz anterior.
      await insertEmergency(
        'blue-variant-prefix',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:00:00', 'Urgencias', 'operator-1', 'Equipo urgencia'`,
      );
      await insertEmergency(
        'blue-variant-pediatric',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:01:00', 'Pediatría', 'operator-1', 'Equipo UCI pediatrica'`,
      );
      await insertEmergency(
        'blue-variant-accent',
        '"team"',
        `'BLUE', 'Central', now(), '2026-08-24 11:02:00', 'Pediatría', 'operator-1', '  EQUIPO  UCI PEDIÁTRICA '`,
      );
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
        idsBefore = await emergencyIds();
        await client.query(readMigration(TEAMS_MIGRATION));
      });

      it('keeps every emergency', async () => {
        expect(await emergencyIds()).toEqual(idsBefore);
      });

      it('maps the free-text team to the BlueTeam enum', async () => {
        const result = await client.query<{ id: string; teams: string[] }>(`
          SELECT id, "teams"::text[] AS teams
          FROM "EmergencyCode" WHERE "type" = 'BLUE'
        `);

        expect(
          [...result.rows].sort((a, b) => a.id.localeCompare(b.id)),
        ).toEqual([
          { id: 'blue-pediatric', teams: ['PEDIATRIC_ICU'] },
          { id: 'blue-uci', teams: ['ICU'] },
          { id: 'blue-urgencia', teams: ['EMERGENCY'] },
          { id: 'blue-variant-accent', teams: ['PEDIATRIC_ICU'] },
          { id: 'blue-variant-pediatric', teams: ['PEDIATRIC_ICU'] },
          { id: 'blue-variant-prefix', teams: ['EMERGENCY'] },
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

      it('keeps every legacy closure without a closing operator and open codes open', async () => {
        const result = await client.query(`
          SELECT id, "closedBy", "closedAt"::text AS "closedAt", "closedByOperatorId"
          FROM "EmergencyCode" WHERE "type" = 'GREEN'
        `);
        const byId = Object.fromEntries(
          result.rows.map((row) => [row.id, row]),
        );

        expect(byId['green-closed']).toEqual({
          id: 'green-closed',
          closedBy: 'Dra. Pérez',
          closedAt: '2026-08-24 10:30:00',
          closedByOperatorId: null,
        });
        expect(byId['green-stale-flag']).toEqual({
          id: 'green-stale-flag',
          closedBy: 'Dr. Rojas',
          closedAt: '2026-08-24 11:20:00',
          closedByOperatorId: null,
        });
        expect(byId['green-open']).toEqual({
          id: 'green-open',
          closedBy: null,
          closedAt: null,
          closedByOperatorId: null,
        });
      });

      it('rejects a blue emergency without teams', async () => {
        await expect(
          client.query(`
            UPDATE "EmergencyCode" SET "teams" = ARRAY[]::"BlueTeam"[] WHERE id = 'blue-uci'
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
            WHERE id = 'blue-uci'
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
