import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesService } from './emergency-codes.service';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from '../operator/operator.service';
import { PrinterService } from '../printer/printer.service';
import { BlueTeam, CodeType, EmergencyCode, Operator } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// DD/MM/YYYY, h:mm AM/PM
const DATE_TIME_PATTERN = /^\d{2}\/\d{2}\/\d{4}, \d{1,2}:\d{2}/;

describe('EmergencyCodesService', () => {
  let service: EmergencyCodesService;
  let prismaService: {
    emergencyCode: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      count: jest.Mock;
    };
  };
  let operatorService: { findOne: jest.Mock };
  let printerService: { createPdf: jest.Mock };

  const operator: Operator = {
    id: 'operator-1',
    name: 'Operador Uno',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  const closingOperator: Operator = {
    ...operator,
    id: 'operator-2',
    name: 'Operador Dos',
  };

  const withOperators = { operator: true, closedByOperator: true };

  const leakEmergency: EmergencyCode & { operator: Operator } = {
    id: 'leak-1',
    type: CodeType.LEAK,
    activeBy: 'Central',
    createdAt: new Date('2026-08-24T10:01:00.000Z'),
    updatedAt: new Date('2026-08-24T10:01:00.000Z'),
    activationTime: new Date('2026-08-24T10:00:00.000Z'),
    location: 'Urgencias',
    operatorId: operator.id,
    observations: null,
    closedBy: null,
    closedAt: null,
    closedByOperatorId: null,
    event: null,
    police: null,
    teams: [],
    emergencyDetail: null,
    cogridNotified: null,
    cogridNotifiedAt: null,
    firefighterCalledTime: null,
    patientName: null,
    patientDescription: 'Vestimenta azul',
    operator,
  };

  const openGreenEmergency: EmergencyCode & { operator: Operator } = {
    ...leakEmergency,
    id: 'green-1',
    type: CodeType.GREEN,
    event: 'Incidente de seguridad',
    police: false,
    patientDescription: null,
  };

  const closure = {
    closedBy: 'Dra. Pérez',
    closedAt: new Date('2026-08-24T10:30:00.000Z'),
    closedByOperatorId: closingOperator.id,
  };

  beforeEach(async () => {
    prismaService = {
      emergencyCode: {
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
    };
    operatorService = {
      findOne: jest.fn(async (id: string) => {
        if (id === operator.id) return operator;
        if (id === closingOperator.id) return closingOperator;
        throw new NotFoundException(`Operador ${id} no encontrado`);
      }),
    };
    printerService = { createPdf: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyCodesService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: OperatorService,
          useValue: operatorService,
        },
        {
          provide: PrinterService,
          useValue: printerService,
        },
      ],
    }).compile();

    service = module.get<EmergencyCodesService>(EmergencyCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('filters and orders listings by activation time', async () => {
    await service.findAll(
      {
        from: new Date('2026-08-01T00:00:00.000Z'),
        to: new Date('2026-08-31T23:59:59.999Z'),
        page: 1,
        limit: 20,
      },
      CodeType.LEAK,
    );

    expect(prismaService.emergencyCode.findMany).toHaveBeenCalledWith({
      where: {
        type: CodeType.LEAK,
        activationTime: {
          gte: new Date('2026-08-01T00:00:00.000Z'),
          lte: new Date('2026-08-31T23:59:59.999Z'),
        },
      },
      take: 20,
      skip: 0,
      orderBy: { activationTime: 'desc' },
      include: withOperators,
    });
  });

  describe('create', () => {
    it('persists non-green emergencies without closure data', async () => {
      prismaService.emergencyCode.create.mockResolvedValue(leakEmergency);

      await service.create({
        type: CodeType.LEAK,
        activeBy: leakEmergency.activeBy,
        activationTime: leakEmergency.activationTime,
        location: leakEmergency.location,
        operatorId: leakEmergency.operatorId,
        patientDescription: leakEmergency.patientDescription!,
      });

      const { data } = prismaService.emergencyCode.create.mock.calls[0][0];
      expect(data).not.toHaveProperty('closedAt');
      expect(data).not.toHaveProperty('closedBy');
      expect(data).not.toHaveProperty('closedByOperatorId');
      expect(prismaService.emergencyCode.create).toHaveBeenCalledWith({
        data,
        include: withOperators,
      });
    });

    it('persists a blue emergency with several teams', async () => {
      prismaService.emergencyCode.create.mockResolvedValue({});

      await service.create({
        type: CodeType.BLUE,
        activeBy: 'Central',
        activationTime: leakEmergency.activationTime,
        location: 'Urgencias',
        operatorId: operator.id,
        teams: [BlueTeam.EMERGENCY, BlueTeam.ICU],
      });

      expect(prismaService.emergencyCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          teams: [BlueTeam.EMERGENCY, BlueTeam.ICU],
        }),
        include: withOperators,
      });
    });

    it('rejects a blue emergency without teams', async () => {
      await expect(
        service.create({
          type: CodeType.BLUE,
          activeBy: 'Central',
          activationTime: leakEmergency.activationTime,
          location: 'Urgencias',
          operatorId: operator.id,
          teams: [],
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaService.emergencyCode.create).not.toHaveBeenCalled();
    });

    it('persists a green emergency created already closed', async () => {
      prismaService.emergencyCode.create.mockResolvedValue({});

      await service.create({
        type: CodeType.GREEN,
        activeBy: 'Central',
        activationTime: openGreenEmergency.activationTime,
        location: 'Urgencias',
        operatorId: operator.id,
        event: 'Incidente',
        police: false,
        ...closure,
      });

      expect(prismaService.emergencyCode.create).toHaveBeenCalledWith({
        data: expect.objectContaining(closure),
        include: withOperators,
      });
    });

    it('rejects a closure registered by an unknown operator', async () => {
      await expect(
        service.create({
          type: CodeType.GREEN,
          activeBy: 'Central',
          activationTime: openGreenEmergency.activationTime,
          location: 'Urgencias',
          operatorId: operator.id,
          event: 'Incidente',
          police: false,
          ...closure,
          closedByOperatorId: 'unknown-operator',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaService.emergencyCode.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('rejects an update that removes a required type-specific field', async () => {
      prismaService.emergencyCode.findUnique.mockResolvedValue(leakEmergency);

      await expect(
        service.update(leakEmergency.id, { patientDescription: '' }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaService.emergencyCode.update).not.toHaveBeenCalled();
    });

    it('does not mistake the empty teams list of a stored row for blue data', async () => {
      prismaService.emergencyCode.findUnique.mockResolvedValue(leakEmergency);
      prismaService.emergencyCode.update.mockResolvedValue(leakEmergency);

      await service.update(leakEmergency.id, { observations: 'Sin novedad' });

      expect(prismaService.emergencyCode.update).toHaveBeenCalledWith({
        where: { id: leakEmergency.id },
        data: { observations: 'Sin novedad' },
        include: withOperators,
      });
    });

    it('closes an open green emergency with caller, time and operator', async () => {
      prismaService.emergencyCode.findUnique.mockResolvedValue(
        openGreenEmergency,
      );
      prismaService.emergencyCode.update.mockResolvedValue({});

      await service.update(openGreenEmergency.id, closure);

      expect(prismaService.emergencyCode.update).toHaveBeenCalledWith({
        where: { id: openGreenEmergency.id },
        data: closure,
        include: withOperators,
      });
    });

    it('rejects a closure without the operator who registers it', async () => {
      prismaService.emergencyCode.findUnique.mockResolvedValue(
        openGreenEmergency,
      );

      await expect(
        service.update(openGreenEmergency.id, {
          closedBy: closure.closedBy,
          closedAt: closure.closedAt,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);

      expect(prismaService.emergencyCode.update).not.toHaveBeenCalled();
    });

    it('rejects a closure registered by an unknown operator', async () => {
      prismaService.emergencyCode.findUnique.mockResolvedValue(
        openGreenEmergency,
      );

      await expect(
        service.update(openGreenEmergency.id, {
          ...closure,
          closedByOperatorId: 'unknown-operator',
        }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prismaService.emergencyCode.update).not.toHaveBeenCalled();
    });

    it('rejects any update on an already closed emergency', async () => {
      prismaService.emergencyCode.findUnique.mockResolvedValue({
        ...openGreenEmergency,
        ...closure,
      });

      await expect(
        service.update(openGreenEmergency.id, { observations: 'Tarde' }),
      ).rejects.toThrow('Emergency Code is already closed');

      expect(prismaService.emergencyCode.update).not.toHaveBeenCalled();
    });
  });

  describe('generatePdf', () => {
    const tableBody = () =>
      printerService.createPdf.mock.calls[0][0].docDefinitions.content[0].table
        .body as unknown[][];

    it('lists every team of a blue emergency by its Spanish name', async () => {
      prismaService.emergencyCode.findMany.mockResolvedValue([
        {
          ...leakEmergency,
          type: CodeType.BLUE,
          teams: [BlueTeam.ICU, BlueTeam.PEDIATRIC_ICU],
        },
      ]);

      await service.generatePdf(CodeType.BLUE);

      const [, row] = tableBody();
      expect(row[1]).toBe('UCI, UCI Pediátrica');
      // Día/mes/año sin depender del idioma del servidor (en-US daría 8/24/2026).
      expect(row[0]).toMatch(DATE_TIME_PATTERN);
    });

    it('shows the COGRID flag and its communication time', async () => {
      const cogridNotifiedAt = new Date('2026-08-24T10:05:00.000Z');
      prismaService.emergencyCode.findMany.mockResolvedValue([
        {
          ...leakEmergency,
          type: CodeType.RED,
          cogridNotified: true,
          cogridNotifiedAt,
        },
        { ...leakEmergency, type: CodeType.RED, cogridNotified: false },
      ]);

      await service.generatePdf(CodeType.RED);

      const [header, notified, notNotified] = tableBody();
      expect(header).toHaveLength(7);
      expect(notified[1]).toBe('Sí');
      expect(notified[2]).toMatch(DATE_TIME_PATTERN);
      expect(notNotified.slice(1, 3)).toEqual(['No', 'N/A']);
    });
  });
});
