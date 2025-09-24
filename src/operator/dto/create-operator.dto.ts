import { IsString } from 'class-validator';

export class CreateOperatorDto {
  @IsString()
  name: string;
}
