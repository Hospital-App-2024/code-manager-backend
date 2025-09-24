import { PartialType } from '@nestjs/mapped-types';
import { CreateFireAlarmDto } from './create-fire-alarm.dto';

export class UpdateFireAlarmDto extends PartialType(CreateFireAlarmDto) {}
