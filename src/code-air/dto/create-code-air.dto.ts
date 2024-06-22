import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
export class CreateCodeAirDto {
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
  @IsString()
  activeBy: string;
  @IsString()
  operatorId: string;
  @IsString()
  location: string;
  @IsString()
  emergencyDetail: string;
}
