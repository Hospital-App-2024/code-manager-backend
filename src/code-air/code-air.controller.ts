import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CodeAirService } from './code-air.service';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { UpdateCodeAirDto } from './dto/update-code-air.dto';

@Controller('code-air')
export class CodeAirController {
  constructor(private readonly codeAirService: CodeAirService) {}

  @Post()
  create(@Body() createCodeAirDto: CreateCodeAirDto) {
    return this.codeAirService.create(createCodeAirDto);
  }

  @Get()
  findAll() {
    return this.codeAirService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codeAirService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCodeAirDto: UpdateCodeAirDto) {
    return this.codeAirService.update(+id, updateCodeAirDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.codeAirService.remove(+id);
  }
}
