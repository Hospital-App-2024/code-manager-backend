import { IsString } from 'class-validator';

export class CreateFireAlarmDto {
  @IsString()
  lazo: string;
  @IsString()
  location: string;
  @IsString()
  nodoId: string;
  @IsString()
  typeDeviceId: string;
  @IsString()
  device: string;
}
