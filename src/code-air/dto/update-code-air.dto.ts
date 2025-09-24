import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeAirDto } from './create-code-air.dto';

export class UpdateCodeAirDto extends PartialType(CreateCodeAirDto) {}
