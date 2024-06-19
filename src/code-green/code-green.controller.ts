import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeGreenService } from './code-green.service';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('code-green')
export class CodeGreenController {
  constructor(private readonly codeGreenService: CodeGreenService) {}

  @Post()
  create(@Body() createCodeGreenDto: CreateCodeGreenDto) {
    return this.codeGreenService.create(createCodeGreenDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.codeGreenService.findAll(paginationDto);
  }
}
