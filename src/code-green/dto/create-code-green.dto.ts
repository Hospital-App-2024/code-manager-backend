import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CreateCodeGreenDto {
  @IsString()
  activeBy: string;
  @IsDate()
  @Type(() => Date)
  createdAt: Date;
  @IsString()
  location: string;
  @IsString()
  event: string;
  @IsString()
  operatorId: string;
}
