-- CreateEnum
CREATE TYPE "Role" AS ENUM ('User', 'Admin', 'Operator');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'User',
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeBlue" (
    "id" TEXT NOT NULL,
    "activeBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "observations" TEXT,

    CONSTRAINT "CodeBlue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeGreen" (
    "id" TEXT NOT NULL,
    "activeBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "police" BOOLEAN NOT NULL,
    "observations" TEXT,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "CodeGreen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeAir" (
    "id" TEXT NOT NULL,
    "activeBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "emergencyDetail" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "observations" TEXT,

    CONSTRAINT "CodeAir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeRed" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "activeBy" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "COGRID" BOOLEAN NOT NULL,
    "firefighterCalledTime" TIMESTAMP(3),
    "observations" TEXT,

    CONSTRAINT "CodeRed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeLeak" (
    "id" TEXT NOT NULL,
    "activeBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "patientDescription" TEXT NOT NULL,
    "observations" TEXT,

    CONSTRAINT "CodeLeak_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Operator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nodo" (
    "id" TEXT NOT NULL,
    "nodo" TEXT NOT NULL,
    "building" TEXT NOT NULL,

    CONSTRAINT "Nodo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "lazo" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "nodoId" TEXT NOT NULL,
    "typeDeviceId" TEXT NOT NULL,
    "operative" BOOLEAN NOT NULL DEFAULT true,
    "observations" TEXT,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeDevice" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "TypeDevice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "CodeBlue" ADD CONSTRAINT "CodeBlue_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeGreen" ADD CONSTRAINT "CodeGreen_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeAir" ADD CONSTRAINT "CodeAir_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeRed" ADD CONSTRAINT "CodeRed_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CodeLeak" ADD CONSTRAINT "CodeLeak_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_nodoId_fkey" FOREIGN KEY ("nodoId") REFERENCES "Nodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_typeDeviceId_fkey" FOREIGN KEY ("typeDeviceId") REFERENCES "TypeDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
