import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CodeBlueService } from './code-blue.service';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { UpdateCodeBlueDto } from './dto/update-code-blue.dto';

@Controller('code-blue')
export class CodeBlueController {
  constructor(private readonly codeBlueService: CodeBlueService) {}

  @Post()
  create(@Body() createCodeBlueDto: CreateCodeBlueDto) {
    return this.codeBlueService.create(createCodeBlueDto);
  }

  @Get()
  findAll() {
    return this.codeBlueService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codeBlueService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCodeBlueDto: UpdateCodeBlueDto) {
    return this.codeBlueService.update(+id, updateCodeBlueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codeBlueService.remove(+id);
  }
}
