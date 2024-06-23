import { Controller, Get, Post, Body } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { operatorAccess } from 'src/common/helper/auth.roles';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorService.create(createOperatorDto);
  }

  @Get()
  @Auth(...operatorAccess)
  findAll() {
    return this.operatorService.findAll();
  }
}
