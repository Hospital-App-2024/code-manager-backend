import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateEmergencyCodeDto } from './create-emergency-code.dto';

export class UpdateEmergencyCodeDto extends PartialType(
  OmitType(CreateEmergencyCodeDto, ['type'] as const),
) {}
