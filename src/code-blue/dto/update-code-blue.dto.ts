import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeBlueDto } from './create-code-blue.dto';

export class UpdateCodeBlueDto extends PartialType(CreateCodeBlueDto) {}
