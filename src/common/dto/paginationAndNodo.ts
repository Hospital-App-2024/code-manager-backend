import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString } from 'class-validator';

export class PaginationAndNodoDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 5;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  nodo?: string;
}
