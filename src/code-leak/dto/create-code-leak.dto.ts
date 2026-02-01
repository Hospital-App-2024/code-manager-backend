import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class CreateCodeLeakDto {
  @IsString()
  activeBy: string;
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
  @IsString()
  location: string;
  @IsString()
  operatorId: string;
  @IsString()
  @IsOptional()
  patientName?: string;
  @IsString()
  patientDescription: string;
}
