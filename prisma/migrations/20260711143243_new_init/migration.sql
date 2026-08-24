-- Safe forward migration from the five production tables to EmergencyCode.
-- Legacy tables remain available for seven days after deployment.
BEGIN;

DO $$
DECLARE
  required_table TEXT;
  duplicate_ids BIGINT;
  orphan_operators BIGINT;
BEGIN
  FOREACH required_table IN ARRAY ARRAY[
    'User', 'Operator', 'CodeGreen', 'CodeBlue', 'CodeAir', 'CodeRed', 'CodeLeak'
  ] LOOP
    IF to_regclass(format('%I', required_table)) IS NULL THEN
      RAISE EXCEPTION 'Preflight failed: required table % does not exist', required_table;
    END IF;
  END LOOP;

  IF to_regclass('"EmergencyCode"') IS NOT NULL THEN
    RAISE EXCEPTION 'Preflight failed: EmergencyCode already exists';
  END IF;

  SELECT COUNT(*) - COUNT(DISTINCT id)
  INTO duplicate_ids
  FROM (
    SELECT id FROM "CodeGreen"
    UNION ALL SELECT id FROM "CodeBlue"
    UNION ALL SELECT id FROM "CodeAir"
    UNION ALL SELECT id FROM "CodeRed"
    UNION ALL SELECT id FROM "CodeLeak"
  ) source_ids;

  IF duplicate_ids > 0 THEN
    RAISE EXCEPTION 'Preflight failed: % duplicate emergency IDs', duplicate_ids;
  END IF;

  SELECT COUNT(*)
  INTO orphan_operators
  FROM (
    SELECT "operatorId" FROM "CodeGreen"
    UNION ALL SELECT "operatorId" FROM "CodeBlue"
    UNION ALL SELECT "operatorId" FROM "CodeAir"
    UNION ALL SELECT "operatorId" FROM "CodeRed"
    UNION ALL SELECT "operatorId" FROM "CodeLeak"
  ) codes
  LEFT JOIN "Operator" operator ON operator.id = codes."operatorId"
  WHERE operator.id IS NULL;

  IF orphan_operators > 0 THEN
    RAISE EXCEPTION 'Preflight failed: % orphan operator references', orphan_operators;
  END IF;
END $$;

CREATE TYPE "CodeType" AS ENUM ('GREEN', 'BLUE', 'AIR', 'RED', 'LEAK');

ALTER TABLE "Operator"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE TABLE "EmergencyCode" (
  "id" TEXT NOT NULL,
  "type" "CodeType" NOT NULL,
  "activeBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "activationTime" TIMESTAMP(3) NOT NULL,
  "location" TEXT NOT NULL,
  "operatorId" TEXT NOT NULL,
  "observations" TEXT,
  "isClosed" BOOLEAN,
  "closedBy" TEXT,
  "closedAt" TIMESTAMP(3),
  "event" TEXT,
  "police" BOOLEAN,
  "team" TEXT,
  "emergencyDetail" TEXT,
  "COGRID" BOOLEAN,
  "firefighterCalledTime" TIMESTAMP(3),
  "patientName" TEXT,
  "patientDescription" TEXT,
  CONSTRAINT "EmergencyCode_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EmergencyCode_type_fields_check" CHECK (
    ("type" = 'GREEN' AND "event" IS NOT NULL AND "police" IS NOT NULL
      AND "team" IS NULL AND "emergencyDetail" IS NULL AND "COGRID" IS NULL
      AND "firefighterCalledTime" IS NULL AND "patientName" IS NULL
      AND "patientDescription" IS NULL)
    OR
    ("type" = 'BLUE' AND "team" IS NOT NULL AND "event" IS NULL
      AND "police" IS NULL AND "emergencyDetail" IS NULL AND "COGRID" IS NULL
      AND "firefighterCalledTime" IS NULL AND "patientName" IS NULL
      AND "patientDescription" IS NULL)
    OR
    ("type" = 'AIR' AND "emergencyDetail" IS NOT NULL AND "event" IS NULL
      AND "police" IS NULL AND "team" IS NULL AND "COGRID" IS NULL
      AND "firefighterCalledTime" IS NULL AND "patientName" IS NULL
      AND "patientDescription" IS NULL)
    OR
    ("type" = 'RED' AND "COGRID" IS NOT NULL AND "event" IS NULL
      AND "police" IS NULL AND "team" IS NULL AND "emergencyDetail" IS NULL
      AND "patientName" IS NULL AND "patientDescription" IS NULL)
    OR
    ("type" = 'LEAK' AND "patientDescription" IS NOT NULL AND "event" IS NULL
      AND "police" IS NULL AND "team" IS NULL AND "emergencyDetail" IS NULL
      AND "COGRID" IS NULL AND "firefighterCalledTime" IS NULL)
  ),
  CONSTRAINT "EmergencyCode_closure_check" CHECK (
    ("type" <> 'GREEN' AND "isClosed" IS NULL
      AND "closedBy" IS NULL AND "closedAt" IS NULL)
    OR
    ("type" = 'GREEN' AND "isClosed" = false
      AND "closedBy" IS NULL AND "closedAt" IS NULL)
    OR
    ("type" = 'GREEN' AND "isClosed" = true
      AND NULLIF(BTRIM("closedBy"), '') IS NOT NULL
      AND "closedAt" IS NOT NULL AND "closedAt" >= "activationTime")
  )
);

INSERT INTO "EmergencyCode" (
  "id", "type", "activeBy", "createdAt", "updatedAt", "activationTime",
  "location", "operatorId", "observations", "isClosed", "closedBy", "closedAt",
  "event", "police", "team", "emergencyDetail", "COGRID",
  "firefighterCalledTime", "patientName", "patientDescription"
)
SELECT "id", 'GREEN'::"CodeType", "activeBy", "createdAt", "createdAt", "createdAt",
  "location", "operatorId", NULL, false, NULL, NULL,
  "event", "police", NULL, NULL, NULL, NULL, NULL, NULL
FROM "CodeGreen"
UNION ALL
SELECT "id", 'BLUE'::"CodeType", "activeBy", "createdAt", "createdAt", "createdAt",
  "location", "operatorId", NULL, NULL, NULL, NULL,
  NULL, NULL, "team", NULL, NULL, NULL, NULL, NULL
FROM "CodeBlue"
UNION ALL
SELECT "id", 'AIR'::"CodeType", "activeBy", "createdAt", "createdAt", "createdAt",
  "location", "operatorId", NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, "emergencyDetail", NULL, NULL, NULL, NULL
FROM "CodeAir"
UNION ALL
SELECT "id", 'RED'::"CodeType", "activeBy", "createdAt", "createdAt", "createdAt",
  "location", "operatorId", NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, "COGRID", "firefighterCalledTime", NULL, NULL
FROM "CodeRed"
UNION ALL
SELECT "id", 'LEAK'::"CodeType", "activeBy", "createdAt", "createdAt", "createdAt",
  "location", "operatorId", NULL, NULL, NULL, NULL,
  NULL, NULL, NULL, NULL, NULL, NULL, NULL, "patientDescription"
FROM "CodeLeak";

ALTER TABLE "EmergencyCode"
  ADD CONSTRAINT "EmergencyCode_operatorId_fkey"
  FOREIGN KEY ("operatorId") REFERENCES "Operator"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "EmergencyCode_type_activationTime_idx"
  ON "EmergencyCode"("type", "activationTime" DESC);
CREATE INDEX "EmergencyCode_activationTime_idx"
  ON "EmergencyCode"("activationTime" DESC);
CREATE INDEX "EmergencyCode_operatorId_idx" ON "EmergencyCode"("operatorId");

DO $$
DECLARE
  legacy_count BIGINT;
  unified_count BIGINT;
BEGIN
  SELECT
    (SELECT COUNT(*) FROM "CodeGreen") +
    (SELECT COUNT(*) FROM "CodeBlue") +
    (SELECT COUNT(*) FROM "CodeAir") +
    (SELECT COUNT(*) FROM "CodeRed") +
    (SELECT COUNT(*) FROM "CodeLeak")
  INTO legacy_count;

  SELECT COUNT(*) INTO unified_count FROM "EmergencyCode";

  IF unified_count <> legacy_count THEN
    RAISE EXCEPTION 'Verification failed: expected % rows, copied %', legacy_count, unified_count;
  END IF;

  IF (SELECT COUNT(*) FROM "EmergencyCode" WHERE "type" = 'GREEN') <> (SELECT COUNT(*) FROM "CodeGreen")
    OR (SELECT COUNT(*) FROM "EmergencyCode" WHERE "type" = 'BLUE') <> (SELECT COUNT(*) FROM "CodeBlue")
    OR (SELECT COUNT(*) FROM "EmergencyCode" WHERE "type" = 'AIR') <> (SELECT COUNT(*) FROM "CodeAir")
    OR (SELECT COUNT(*) FROM "EmergencyCode" WHERE "type" = 'RED') <> (SELECT COUNT(*) FROM "CodeRed")
    OR (SELECT COUNT(*) FROM "EmergencyCode" WHERE "type" = 'LEAK') <> (SELECT COUNT(*) FROM "CodeLeak") THEN
    RAISE EXCEPTION 'Verification failed: per-type row counts differ';
  END IF;
END $$;

ALTER TABLE "CodeGreen" RENAME TO "CodeGreen_legacy_20260824";
ALTER TABLE "CodeBlue" RENAME TO "CodeBlue_legacy_20260824";
ALTER TABLE "CodeAir" RENAME TO "CodeAir_legacy_20260824";
ALTER TABLE "CodeRed" RENAME TO "CodeRed_legacy_20260824";
ALTER TABLE "CodeLeak" RENAME TO "CodeLeak_legacy_20260824";

ALTER TABLE "Operator" ALTER COLUMN "updatedAt" DROP DEFAULT;

COMMIT;
