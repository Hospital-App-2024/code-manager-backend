import { PartialType } from '@nestjs/mapped-types';
import { CreateEmergencyCodeDto } from './create-emergency-code.dto';

export class UpdateEmergencyCodeDto extends PartialType(CreateEmergencyCodeDto) {}
