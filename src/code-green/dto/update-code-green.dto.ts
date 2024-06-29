import { PartialType } from '@nestjs/mapped-types';
import { CreateCodeGreenDto } from './create-code-green.dto';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCodeGreenDto extends PartialType(CreateCodeGreenDto) {
  @IsString()
  @IsOptional()
  observations?: string;
  @IsBoolean()
  @IsOptional()
  isClosed: boolean;
  @IsString()
  @IsOptional()
  closedBy: string;
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  closedAt: Date;
}
