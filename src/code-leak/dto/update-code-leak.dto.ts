import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeLeakDto } from './create-code-leak.dto';

export class UpdateCodeLeakDto extends PartialType(CreateCodeLeakDto) {}
