import { Module } from '@nestjs/common';
import { FireAlarmsService } from './fire-alarms.service';
import { FireAlarmsController } from './fire-alarms.controller';

@Module({
  controllers: [FireAlarmsController],
  providers: [FireAlarmsService],
})
export class FireAlarmsModule {}
