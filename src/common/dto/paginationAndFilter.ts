import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsPositive } from 'class-validator';

export class PaginationAndFilterDto {
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  from?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
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
