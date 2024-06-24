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
  @IsOptional()
  @Type(() => Number)
  limit?: number = 5;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;
}
