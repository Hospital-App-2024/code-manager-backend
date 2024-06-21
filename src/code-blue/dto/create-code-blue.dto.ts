import { Type } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';
import { ToLower } from 'src/common/helper/ToLower';

export class CreateCodeBlueDto {
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
  @ToLower()
  team: string;
}
