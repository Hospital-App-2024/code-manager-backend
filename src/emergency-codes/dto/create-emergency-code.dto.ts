import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateIf,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlueTeam, CodeType } from '@prisma/client';

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

  // Closure (GREEN only): a code is closed once these three are sent together.
  @IsOptional()
  @IsString()
  closedBy?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  closedAt?: Date;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  closedByOperatorId?: string;

  // Code Blue Fields
  @ValidateIf((o) => o.type === CodeType.BLUE)
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(BlueTeam, { each: true })
  teams?: BlueTeam[];

  // Code Air Fields
  @ValidateIf((o) => o.type === CodeType.AIR)
  @IsString()
  @IsNotEmpty()
  emergencyDetail?: string;

  // Code Red Fields
  @ValidateIf((o) => o.type === CodeType.RED)
  @IsBoolean()
  cogridNotified?: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  cogridNotifiedAt?: Date;

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
