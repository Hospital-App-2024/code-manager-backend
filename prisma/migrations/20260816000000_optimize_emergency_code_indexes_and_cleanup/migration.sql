-- AlterTable
ALTER TABLE "EmergencyCode" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Operator" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "EmergencyCode_type_createdAt_idx" ON "EmergencyCode"("type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "EmergencyCode_createdAt_idx" ON "EmergencyCode"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "EmergencyCode_operatorId_idx" ON "EmergencyCode"("operatorId");

-- CreateIndex
CREATE INDEX "EmergencyCode_isClosed_idx" ON "EmergencyCode"("isClosed");
