import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeGreenDto } from './create-code-green.dto';

export class UpdateCodeGreenDto extends PartialType(CreateCodeGreenDto) {}
