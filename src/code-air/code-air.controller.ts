import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeAirService } from './code-air.service';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';

@Controller('code-air')
export class CodeAirController {
  constructor(private readonly codeAirService: CodeAirService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createCodeAirDto: CreateCodeAirDto) {
    return this.codeAirService.create(createCodeAirDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeAirService.findAll(paginationAndFilterDto);
  }
}
