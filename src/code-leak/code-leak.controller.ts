import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
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

  @Get('report')
  public async generateReport(@Res() response: Response) {
    const pdfDoc = await this.codeLeakService.generatePdf();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código de Fuga';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get('total-by-month')
  @Auth(...basicAccess)
  findAllMonthlyTotals() {
    return this.codeLeakService.findMonthly();
  }
}
