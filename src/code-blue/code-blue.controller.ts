import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CodeBlueService } from './code-blue.service';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';

@Controller('code-blue')
export class CodeBlueController {
  constructor(private readonly codeBlueService: CodeBlueService) {}

  @Post()
  create(@Body() createCodeBlueDto: CreateCodeBlueDto) {
    return this.codeBlueService.create(createCodeBlueDto);
  }

  @Get()
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeBlueService.findAll(paginationAndFilterDto);
  }

  @Get('report')
  public async generateReport(@Res() response: Response) {
    const pdfDoc = await this.codeBlueService.generatePdf();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código Azul';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
