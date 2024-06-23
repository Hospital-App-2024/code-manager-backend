import { Controller, Get, Post, Body, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CodeBlueService } from './code-blue.service';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';

@Controller('code-blue')
export class CodeBlueController {
  constructor(private readonly codeBlueService: CodeBlueService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createCodeBlueDto: CreateCodeBlueDto) {
    return this.codeBlueService.create(createCodeBlueDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeBlueService.findAll(paginationAndFilterDto);
  }

  @Get('report')
  @Auth(...basicAccess)
  public async generateReport(@Res() response: Response) {
    const pdfDoc = await this.codeBlueService.generatePdf();

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código Azul';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }
}
