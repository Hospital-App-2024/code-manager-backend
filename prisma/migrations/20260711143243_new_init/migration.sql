/*
  Warnings:

  - You are about to drop the `CodeAir` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeBlue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeGreen` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeLeak` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CodeRed` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Device` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Nodo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeDevice` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CodeType" AS ENUM ('GREEN', 'BLUE', 'AIR', 'RED', 'LEAK');

-- DropForeignKey
ALTER TABLE "CodeAir" DROP CONSTRAINT "CodeAir_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "CodeBlue" DROP CONSTRAINT "CodeBlue_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "CodeGreen" DROP CONSTRAINT "CodeGreen_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "CodeLeak" DROP CONSTRAINT "CodeLeak_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "CodeRed" DROP CONSTRAINT "CodeRed_operatorId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_nodoId_fkey";

-- DropForeignKey
ALTER TABLE "Device" DROP CONSTRAINT "Device_typeDeviceId_fkey";

-- DropTable
DROP TABLE "CodeAir";

-- DropTable
DROP TABLE "CodeBlue";

-- DropTable
DROP TABLE "CodeGreen";

-- DropTable
DROP TABLE "CodeLeak";

-- DropTable
DROP TABLE "CodeRed";

-- DropTable
DROP TABLE "Device";

-- DropTable
DROP TABLE "Nodo";

-- DropTable
DROP TABLE "TypeDevice";

-- CreateTable
CREATE TABLE "EmergencyCode" (
    "id" TEXT NOT NULL,
    "type" "CodeType" NOT NULL,
    "activeBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activationTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "observations" TEXT,
    "event" TEXT,
    "police" BOOLEAN,
    "isClosed" BOOLEAN DEFAULT false,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "team" TEXT,
    "emergencyDetail" TEXT,
    "COGRID" BOOLEAN,
    "firefighterCalledTime" TIMESTAMP(3),
    "patientName" TEXT,
    "patientDescription" TEXT,

    CONSTRAINT "EmergencyCode_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmergencyCode" ADD CONSTRAINT "EmergencyCode_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
