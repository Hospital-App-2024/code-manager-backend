import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeRedService } from './code-red.service';
import { CreateCodeRedDto } from './dto/create-code-red.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';

@Controller('code-red')
export class CodeRedController {
  constructor(private readonly codeRedService: CodeRedService) {}

  @Post()
  create(@Body() createCodeRedDto: CreateCodeRedDto) {
    return this.codeRedService.create(createCodeRedDto);
  }

  @Get()
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeRedService.findAll(paginationAndFilterDto);
  }
}
