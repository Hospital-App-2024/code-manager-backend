import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeLeakService } from './code-leak.service';
import { CreateCodeLeakDto } from './dto/create-code-leak.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';

@Controller('code-leak')
export class CodeLeakController {
  constructor(private readonly codeLeakService: CodeLeakService) {}

  @Post()
  create(@Body() createCodeLeakDto: CreateCodeLeakDto) {
    return this.codeLeakService.create(createCodeLeakDto);
  }

  @Get()
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeLeakService.findAll(paginationAndFilterDto);
  }
}
