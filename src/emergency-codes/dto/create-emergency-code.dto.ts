import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateIf,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CodeType } from '@prisma/client';

export class CreateEmergencyCodeDto {
  @IsEnum(CodeType)
  @IsNotEmpty()
  type: CodeType;

  @IsString()
  @IsNotEmpty()
  activeBy: string;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  activationTime: Date;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  operatorId: string;

  @IsOptional()
  @IsString()
  observations?: string;

  // Code Green Fields
  @ValidateIf((o) => o.type === CodeType.GREEN)
  @IsString()
  @IsNotEmpty()
  event?: string;

  @ValidateIf((o) => o.type === CodeType.GREEN)
  @IsBoolean()
  police?: boolean;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @IsOptional()
  @IsString()
  closedBy?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closedAt?: Date;

  // Code Blue Fields
  @ValidateIf((o) => o.type === CodeType.BLUE)
  @IsString()
  @IsNotEmpty()
  team?: string;

  // Code Air Fields
  @ValidateIf((o) => o.type === CodeType.AIR)
  @IsString()
  @IsNotEmpty()
  emergencyDetail?: string;

  // Code Red Fields
  @ValidateIf((o) => o.type === CodeType.RED)
  @IsBoolean()
  COGRID?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  firefighterCalledTime?: Date;

  // Code Leak Fields
  @IsOptional()
  @IsString()
  patientName?: string;

  @ValidateIf((o) => o.type === CodeType.LEAK)
  @IsString()
  @IsNotEmpty()
  patientDescription?: string;
}
