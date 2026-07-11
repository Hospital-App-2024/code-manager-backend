import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyCodesController } from './emergency-codes.controller';

describe('EmergencyCodesController', () => {
  let controller: EmergencyCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmergencyCodesController],
    }).compile();

    controller = module.get<EmergencyCodesController>(EmergencyCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
