-- Código Azul: "team" (texto libre, un equipo) -> "teams" (enum[], uno o más).
-- Código Rojo: "COGRID" -> "cogridNotified" + hora opcional "cogridNotifiedAt".
-- Código Verde: se elimina "isClosed" (abierto = "closedAt" NULL) y se agrega
-- el operador que registra el cierre.

CREATE TYPE "BlueTeam" AS ENUM ('EMERGENCY', 'ICU', 'PEDIATRIC_ICU');

ALTER TABLE "EmergencyCode"
  DROP CONSTRAINT "EmergencyCode_type_fields_check",
  DROP CONSTRAINT "EmergencyCode_closure_check";

ALTER TABLE "EmergencyCode"
  ADD COLUMN "teams" "BlueTeam"[] DEFAULT ARRAY[]::"BlueTeam"[],
  ADD COLUMN "cogridNotifiedAt" TIMESTAMP(3),
  ADD COLUMN "closedByOperatorId" TEXT;

ALTER TABLE "EmergencyCode" RENAME COLUMN "COGRID" TO "cogridNotified";

-- Normaliza "Equipo UCI  Pediátrica " -> "uci pediatrica" antes de mapear:
-- sin tildes (en ambas capitalizaciones), minúsculas, espacios colapsados y
-- sin el prefijo "equipo".
UPDATE "EmergencyCode"
SET "teams" = CASE regexp_replace(
    lower(translate(regexp_replace(btrim("team"), '\s+', ' ', 'g'),
      'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')),
    '^equipo ', '')
  WHEN 'urgencia' THEN ARRAY['EMERGENCY']::"BlueTeam"[]
  WHEN 'urgencias' THEN ARRAY['EMERGENCY']::"BlueTeam"[]
  WHEN 'uci' THEN ARRAY['ICU']::"BlueTeam"[]
  WHEN 'uci pediatrica' THEN ARRAY['PEDIATRIC_ICU']::"BlueTeam"[]
END
WHERE "type" = 'BLUE';

-- Falla en vez de perder datos si existe un equipo que no se pudo mapear.
DO $$
DECLARE
  unmapped TEXT;
BEGIN
  SELECT string_agg(DISTINCT "team", ', ') INTO unmapped
  FROM "EmergencyCode"
  WHERE "type" = 'BLUE' AND ("teams" IS NULL OR cardinality("teams") = 0);

  IF unmapped IS NOT NULL THEN
    RAISE EXCEPTION 'Valores de "team" sin mapear a BlueTeam: %', unmapped;
  END IF;
END $$;

-- "isClosed" es derivable: el check anterior garantizaba
-- isClosed = true <=> closedAt NOT NULL, así que no se pierde información.
ALTER TABLE "EmergencyCode"
  DROP COLUMN "team",
  DROP COLUMN "isClosed";

ALTER TABLE "EmergencyCode"
  ADD CONSTRAINT "EmergencyCode_closedByOperatorId_fkey"
  FOREIGN KEY ("closedByOperatorId") REFERENCES "Operator"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "EmergencyCode_closedByOperatorId_idx"
  ON "EmergencyCode"("closedByOperatorId");

ALTER TABLE "EmergencyCode"
  ADD CONSTRAINT "EmergencyCode_type_fields_check" CHECK (
    ("type" = 'GREEN' AND "event" IS NOT NULL AND "police" IS NOT NULL
      AND COALESCE(cardinality("teams"), 0) = 0 AND "emergencyDetail" IS NULL
      AND "cogridNotified" IS NULL AND "cogridNotifiedAt" IS NULL
      AND "firefighterCalledTime" IS NULL AND "patientName" IS NULL
      AND "patientDescription" IS NULL)
    OR
    ("type" = 'BLUE' AND cardinality("teams") > 0 AND "event" IS NULL
      AND "police" IS NULL AND "emergencyDetail" IS NULL
      AND "cogridNotified" IS NULL AND "cogridNotifiedAt" IS NULL
      AND "firefighterCalledTime" IS NULL AND "patientName" IS NULL
      AND "patientDescription" IS NULL)
    OR
    ("type" = 'AIR' AND "emergencyDetail" IS NOT NULL AND "event" IS NULL
      AND "police" IS NULL AND COALESCE(cardinality("teams"), 0) = 0
      AND "cogridNotified" IS NULL AND "cogridNotifiedAt" IS NULL
      AND "firefighterCalledTime" IS NULL AND "patientName" IS NULL
      AND "patientDescription" IS NULL)
    OR
    ("type" = 'RED' AND "cogridNotified" IS NOT NULL
      AND ("cogridNotifiedAt" IS NULL OR "cogridNotified" = true)
      AND "event" IS NULL AND "police" IS NULL
      AND COALESCE(cardinality("teams"), 0) = 0 AND "emergencyDetail" IS NULL
      AND "patientName" IS NULL AND "patientDescription" IS NULL)
    OR
    ("type" = 'LEAK' AND "patientDescription" IS NOT NULL AND "event" IS NULL
      AND "police" IS NULL AND COALESCE(cardinality("teams"), 0) = 0
      AND "emergencyDetail" IS NULL AND "cogridNotified" IS NULL
      AND "cogridNotifiedAt" IS NULL AND "firefighterCalledTime" IS NULL)
  ),
  ADD CONSTRAINT "EmergencyCode_closure_check" CHECK (
    ("closedBy" IS NULL AND "closedAt" IS NULL AND "closedByOperatorId" IS NULL)
    OR
    ("type" = 'GREEN'
      AND NULLIF(BTRIM("closedBy"), '') IS NOT NULL
      AND "closedAt" IS NOT NULL AND "closedAt" >= "activationTime")
  );
