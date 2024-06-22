import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeAirService } from './code-air.service';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';

@Controller('code-air')
export class CodeAirController {
  constructor(private readonly codeAirService: CodeAirService) {}

  @Post()
  create(@Body() createCodeAirDto: CreateCodeAirDto) {
    return this.codeAirService.create(createCodeAirDto);
  }

  @Get()
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeAirService.findAll(paginationAndFilterDto);
  }
}
