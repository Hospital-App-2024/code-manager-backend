import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FireAlarmsService } from './fire-alarms.service';
import { CreateFireAlarmDto } from './dto/create-fire-alarm.dto';
import { CreateNodoDto, CreateTypeDeviceDto } from './dto';
import { PaginationAndNodoDto } from '../common/dto/paginationAndNodo';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';

@Controller('fire-alarms')
export class FireAlarmsController {
  constructor(private readonly fireAlarmsService: FireAlarmsService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createFireAlarmDto: CreateFireAlarmDto) {
    return this.fireAlarmsService.create(createFireAlarmDto);
  }

  @Post('type-device')
  @Auth(...operatorAccess)
  createTypeDevice(@Body() createTypeDeviceDto: CreateTypeDeviceDto) {
    return this.fireAlarmsService.createTypeDevice(createTypeDeviceDto);
  }

  @Get('type-device')
  @Auth(...basicAccess)
  findAllTypeDevices() {
    return this.fireAlarmsService.findAllTypeDevices();
  }

  @Post('nodo')
  @Auth(...operatorAccess)
  createNodo(@Body() createNodoDto: CreateNodoDto) {
    return this.fireAlarmsService.createNodo(createNodoDto);
  }

  @Get('nodo')
  @Auth(...basicAccess)
  findAllNodo() {
    return this.fireAlarmsService.findAllNodos();
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndNodoDto: PaginationAndNodoDto) {
    return this.fireAlarmsService.findAll(paginationAndNodoDto);
  }

  @Get(':id')
  @Auth(...operatorAccess)
  findOne(@Param('id') id: string) {
    return this.fireAlarmsService.findOne(+id);
  }
}
