import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesService } from './emergency-codes.service';

describe('EmergencyCodesService', () => {
  let service: EmergencyCodesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmergencyCodesService],
    }).compile();

    service = module.get<EmergencyCodesService>(EmergencyCodesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
