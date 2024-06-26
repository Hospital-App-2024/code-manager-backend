import {
  IsNumber,
  IsPositive,
  IsString,
  IsUppercase,
  MinLength,
} from 'class-validator';

export class CreateNodoDto {
  @IsNumber()
  @IsPositive()
  nodo: number;
  @IsString()
  @MinLength(1, {
    message: 'Mínimo 1 carácter',
  })
  @IsUppercase({
    message: 'Ingrese un valor en mayúsculas',
  })
  building: string;
}
