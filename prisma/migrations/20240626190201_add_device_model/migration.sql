-- CreateTable
CREATE TABLE "Nodo" (
    "id" TEXT NOT NULL,
    "nodo" INTEGER NOT NULL,
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

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_nodoId_fkey" FOREIGN KEY ("nodoId") REFERENCES "Nodo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_typeDeviceId_fkey" FOREIGN KEY ("typeDeviceId") REFERENCES "TypeDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
