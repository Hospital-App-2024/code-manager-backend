import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

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
  patientDescription: string;
}
