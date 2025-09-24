import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeRedDto } from './create-code-red.dto';

export class UpdateCodeRedDto extends PartialType(CreateCodeRedDto) {}
