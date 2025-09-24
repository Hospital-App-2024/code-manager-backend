import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class CreateCodeRedDto {
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
  @IsString()
  activeBy: string;
  @IsString()
  operatorId: string;
  @IsString()
  location: string;
  @IsBoolean()
  COGRID: boolean;
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  firefighterCalledTime?: Date;
}
