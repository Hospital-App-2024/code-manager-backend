import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationAndFilterDto {
  @IsOptional()
  @Type(() => Date)
  from?: Date;

  @IsOptional()
  @Type(() => Date)
  to?: Date;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number;
}