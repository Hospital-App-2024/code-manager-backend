import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { CodeLeakService } from './code-leak.service';
import { CreateCodeLeakDto } from './dto/create-code-leak.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';

@Controller('code-leak')
export class CodeLeakController {
  constructor(private readonly codeLeakService: CodeLeakService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createCodeLeakDto: CreateCodeLeakDto) {
    return this.codeLeakService.create(createCodeLeakDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeLeakService.findAll(paginationAndFilterDto);
  }
}
