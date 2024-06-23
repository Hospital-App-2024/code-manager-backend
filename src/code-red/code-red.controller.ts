import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeRedService } from './code-red.service';
import { CreateCodeRedDto } from './dto/create-code-red.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('code-red')
export class CodeRedController {
  constructor(private readonly codeRedService: CodeRedService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createCodeRedDto: CreateCodeRedDto) {
    return this.codeRedService.create(createCodeRedDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeRedService.findAll(paginationAndFilterDto);
  }
}
