import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorService.create(createOperatorDto);
  }

  @Get()
  findAll() {
    return this.operatorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operatorService.findOne(+id);
  }
}
