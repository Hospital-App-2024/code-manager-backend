import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { OperatorService } from './operator.service';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import {
  adminAccess,
  basicAccess,
  operatorAccess,
} from 'src/common/helper/auth.roles';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';

@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Post()
  @Auth(...adminAccess)
  create(@Body() createOperatorDto: CreateOperatorDto) {
    return this.operatorService.create(createOperatorDto);
  }

  @Get()
  @Auth(...operatorAccess)
  findAll() {
    return this.operatorService.findAll();
  }

  @Get('pagination')
  @Auth(...basicAccess)
  findAllWithPagination(
    @Query() paginationAndFilterDto: PaginationAndFilterDto,
  ) {
    return this.operatorService.findAllWithPagination(paginationAndFilterDto);
  }
}
