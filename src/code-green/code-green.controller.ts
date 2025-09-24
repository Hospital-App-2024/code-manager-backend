import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  Patch,
  Param,
} from '@nestjs/common';
import { CodeGreenService } from './code-green.service';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { Response } from 'express';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { basicAccess, operatorAccess } from 'src/common/helper/auth.roles';
import { UpdateCodeGreenDto } from './dto/update-code-green.dto';

@Controller('code-green')
export class CodeGreenController {
  constructor(private readonly codeGreenService: CodeGreenService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createCodeGreenDto: CreateCodeGreenDto) {
    return this.codeGreenService.create(createCodeGreenDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() paginationAndFilterDto: PaginationAndFilterDto) {
    return this.codeGreenService.findAll(paginationAndFilterDto);
  }

  @Get('total-by-month')
  @Auth(...basicAccess)
  findAllMonthlyTotals() {
    return this.codeGreenService.findMonthly();
  }

  @Get('report')
  public async generateReport(
    @Res() response: Response,
    @Query() paginationAndFilterDto: PaginationAndFilterDto,
  ) {
    const pdfDoc = await this.codeGreenService.generatePdf(
      paginationAndFilterDto,
    );

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = 'Código Verde';
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get(':id')
  @Auth(...operatorAccess)
  findOne(@Param('id') id: string) {
    return this.codeGreenService.findOne(id);
  }

  @Patch(':id')
  @Auth(...operatorAccess)
  update(
    @Param('id') id: string,
    @Body() updateCodeGreenDto: UpdateCodeGreenDto,
  ) {
    return this.codeGreenService.update(id, updateCodeGreenDto);
  }
}
