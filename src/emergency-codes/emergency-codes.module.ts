import { Module } from '@nestjs/common';
import { EmergencyCodesController } from './emergency-codes.controller';
import { EmergencyCodesService } from './emergency-codes.service';

@Module({
  controllers: [EmergencyCodesController],
  providers: [EmergencyCodesService]
})
export class EmergencyCodesModule {}
