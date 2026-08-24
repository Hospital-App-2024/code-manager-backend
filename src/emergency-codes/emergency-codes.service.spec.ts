import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesService } from './emergency-codes.service';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from '../operator/operator.service';
import { PrinterService } from '../printer/printer.service';
import { CodeType, EmergencyCode, Operator } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

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

  const operator: Operator = {
    id: 'operator-1',
    name: 'Operador Uno',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };

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
    isClosed: null,
    closedBy: null,
    closedAt: null,
    event: null,
    police: null,
    team: null,
    emergencyDetail: null,
    COGRID: null,
    firefighterCalledTime: null,
    patientName: null,
    patientDescription: 'Vestimenta azul',
    operator,
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
    operatorService = { findOne: jest.fn().mockResolvedValue(operator) };

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
          useValue: {
            createPdf: jest.fn(),
          },
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
      include: { operator: true },
    });
  });

  it('persists non-green emergencies without closure state', async () => {
    prismaService.emergencyCode.create.mockResolvedValue(leakEmergency);

    await service.create({
      type: CodeType.LEAK,
      activeBy: leakEmergency.activeBy,
      activationTime: leakEmergency.activationTime,
      location: leakEmergency.location,
      operatorId: leakEmergency.operatorId,
      patientDescription: leakEmergency.patientDescription,
    });

    expect(prismaService.emergencyCode.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ isClosed: null }),
      include: { operator: true },
    });
  });

  it('rejects an update that removes a required type-specific field', async () => {
    prismaService.emergencyCode.findUnique.mockResolvedValue(leakEmergency);

    await expect(
      service.update(leakEmergency.id, { patientDescription: '' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prismaService.emergencyCode.update).not.toHaveBeenCalled();
  });
});
