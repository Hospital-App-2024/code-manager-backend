import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('report')
  public async generateReport(@Res() response: Response) {
    const pdfDoc = await this.codeRedService.generatePdf();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código Azul';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('total-by-month')
  @Auth(...basicAccess)
  findAllMonthlyTotals() {
    return this.codeRedService.findMonthly();
  }
}
