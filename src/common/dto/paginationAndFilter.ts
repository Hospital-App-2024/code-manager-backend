import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationAndFilterDto {
  @Type(() => Date)
  @IsOptional()
  from?: Date;

  @Type(() => Date)
  @IsOptional()
  to?: Date;

  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @IsPositive()
  @Type(() => Number)
  @IsOptional()
  page?: number;
}
