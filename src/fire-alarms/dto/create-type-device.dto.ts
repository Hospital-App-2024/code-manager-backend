import { IsString, MinLength } from 'class-validator';

export class CreateTypeDeviceDto {
  @IsString()
  @MinLength(3, {
    message: 'Mínimo 3 carácter',
  })
  type: string;
}
