import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CodeAirService } from './code-air.service';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';

@Controller('code-air')
export class CodeAirController {
  constructor(private readonly codeAirService: CodeAirService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createCodeAirDto: CreateCodeAirDto) {
    return this.codeAirService.create(createCodeAirDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeAirService.findAll(paginationAndFilterDto);
  }

  @Get('report')
  public async generateReport(@Res() response: Response) {
    const pdfDoc = await this.codeAirService.generatePdf();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código Aéreo';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('total-by-month')
  findAllMonthlyTotals() {
    return this.codeAirService.findMonthly();
  }
}
