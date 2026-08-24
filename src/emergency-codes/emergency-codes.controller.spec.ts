import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesController } from './emergency-codes.controller';
import { EmergencyCodesService } from './emergency-codes.service';
import { PassportModule } from '@nestjs/passport';
import { GUARDS_METADATA } from '@nestjs/common/constants';

describe('EmergencyCodesController', () => {
  let controller: EmergencyCodesController;

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
});
