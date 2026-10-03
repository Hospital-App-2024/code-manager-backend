import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesController } from './emergency-codes.controller';
import { EmergencyCodesService } from './emergency-codes.service';
import { PassportModule } from '@nestjs/passport';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { CodeType } from '@prisma/client';
import { Response } from 'express';

describe('EmergencyCodesController', () => {
  let controller: EmergencyCodesController;
  let service: { generatePdf: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [EmergencyCodesController],
      providers: [
        {
          provide: EmergencyCodesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            findMonthly: jest.fn(),
            generatePdf: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EmergencyCodesController>(EmergencyCodesController);
    service = module.get(EmergencyCodesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('protects PDF reports with authentication guards', () => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      EmergencyCodesController.prototype.generateReport,
    );

    expect(guards).toHaveLength(2);
  });

  describe('generateReport', () => {
    const makeResponse = () =>
      ({
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn(),
      }) as unknown as Response;

    it('forwards the type and the date range to the report', async () => {
      const pdf = { info: {}, pipe: jest.fn(), end: jest.fn() };
      service.generatePdf.mockResolvedValue(pdf);
      const response = makeResponse();
      const from = new Date('2026-09-01T03:00:00.000Z');
      const to = new Date('2026-10-01T02:59:59.999Z');

      await controller.generateReport(response, {
        type: CodeType.BLUE,
        from,
        to,
      });

      expect(service.generatePdf).toHaveBeenCalledWith(CodeType.BLUE, {
        from,
        to,
      });
      expect(response.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'application/pdf',
      );
      expect(pdf.pipe).toHaveBeenCalledWith(response);
      expect(pdf.end).toHaveBeenCalled();
    });

    it('answers 400 without a type and does not build the report', async () => {
      const response = makeResponse();

      await controller.generateReport(response, {});

      expect(response.status).toHaveBeenCalledWith(400);
      expect(service.generatePdf).not.toHaveBeenCalled();
    });
  });
});
