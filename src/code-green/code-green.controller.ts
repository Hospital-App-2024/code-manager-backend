import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { CodeGreenService } from './code-green.service';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { Response } from 'express';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';

@Controller('code-green')
export class CodeGreenController {
  constructor(private readonly codeGreenService: CodeGreenService) {}

  @Post()
  create(@Body() createCodeGreenDto: CreateCodeGreenDto) {
    return this.codeGreenService.create(createCodeGreenDto);
  }

  @Get()
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeGreenService.findAll(paginationAndFilterDto);
  }

  @Get('report')
  public async generateReport(@Res() response: Response) {
    const pdfDoc = await this.codeGreenService.generatePdf();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código Verde';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
