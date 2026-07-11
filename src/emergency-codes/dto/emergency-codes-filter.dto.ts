import { IsEnum, IsOptional } from 'class-validator';
import { PaginationAndFilterDto } from '../../common/dto/paginationAndFilter';
import { CodeType } from '@prisma/client';

export class EmergencyCodesFilterDto extends PaginationAndFilterDto {
  @IsEnum(CodeType)
  @IsOptional()
  type?: CodeType;
}
