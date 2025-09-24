import { IsString, IsUppercase, MinLength } from 'class-validator';

export class CreateNodoDto {
  @IsString()
  @MinLength(1, {
    message: 'Mínimo 1 carácter',
  })
  nodo: string;
  @IsString()
  @MinLength(1, {
    message: 'Mínimo 1 carácter',
  })
  @IsUppercase({
    message: 'Ingrese un valor en mayúsculas',
  })
  building: string;
}
