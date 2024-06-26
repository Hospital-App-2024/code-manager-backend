import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { FireAlarmsService } from './fire-alarms.service';
import { CreateFireAlarmDto } from './dto/create-fire-alarm.dto';
import { CreateNodoDto, CreateTypeDeviceDto } from './dto';
import { PaginationAndNodoDto } from '../common/dto/paginationAndNodo';

@Controller('fire-alarms')
export class FireAlarmsController {
  constructor(private readonly fireAlarmsService: FireAlarmsService) {}

  @Post()
  create(@Body() createFireAlarmDto: CreateFireAlarmDto) {
    return this.fireAlarmsService.create(createFireAlarmDto);
  }

  @Post('type-device')
  createTypeDevice(@Body() createTypeDeviceDto: CreateTypeDeviceDto) {
    return this.fireAlarmsService.createTypeDevice(createTypeDeviceDto);
  }

  @Get('type-device')
  findAllTypeDevices() {
    return this.fireAlarmsService.findAllTypeDevices();
  }

  @Post('nodo')
  createNodo(@Body() createNodoDto: CreateNodoDto) {
    return this.fireAlarmsService.createNodo(createNodoDto);
  }

  @Get('nodo')
  findAllNodo() {
    return this.fireAlarmsService.findAllNodos();
  }

  @Get()
  findAll(@Query() paginationAndNodoDto: PaginationAndNodoDto) {
    return this.fireAlarmsService.findAll(paginationAndNodoDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fireAlarmsService.findOne(+id);
  }
}
