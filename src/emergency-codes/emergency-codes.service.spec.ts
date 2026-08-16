import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesService } from './emergency-codes.service';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from '../operator/operator.service';
import { PrinterService } from '../printer/printer.service';

describe('EmergencyCodesService', () => {
  let service: EmergencyCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmergencyCodesService,
        {
          provide: PrismaService,
          useValue: {
            emergencyCode: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
        {
          provide: OperatorService,
          useValue: {
            findOne: jest.fn(),
          },
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
});
