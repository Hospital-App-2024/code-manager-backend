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
import { Response } from 'express';

import { EmergencyCodesService } from './emergency-codes.service';

import { Auth } from '../auth/decorators/auth.decorator';

import { CreateEmergencyCodeDto } from './dto/create-emergency-code.dto';
import { UpdateEmergencyCodeDto } from './dto/update-emergency-code.dto';
import { EmergencyCodesFilterDto } from './dto/emergency-codes-filter.dto';

import { basicAccess, operatorAccess } from '../common/helper/auth.roles';
import { CodeType } from '@prisma/client';

@Controller('emergency-codes')
export class EmergencyCodesController {
  constructor(private readonly emergencyCodesService: EmergencyCodesService) {}

  @Post()
  @Auth(...operatorAccess)
  create(@Body() createEmergencyCodeDto: CreateEmergencyCodeDto) {
    return this.emergencyCodesService.create(createEmergencyCodeDto);
  }

  @Get()
  @Auth(...basicAccess)
  findAll(@Query() filterDto: EmergencyCodesFilterDto) {
    return this.emergencyCodesService.findAll(filterDto, filterDto.type);
  }

  @Get('total-by-month')
  @Auth(...basicAccess)
  findAllMonthlyTotals(@Query('type') type?: CodeType) {
    return this.emergencyCodesService.findMonthly(type);
  }

  @Get('report')
  @Auth(...basicAccess)
  public async generateReport(
    @Res() response: Response,
    @Query('type') type: CodeType,
  ) {
    if (!type) {
      return response
        .status(400)
        .json({ message: 'Se requiere el query param type' });
    }

    const pdfDoc = await this.emergencyCodesService.generatePdf(type);

    response.setHeader('Content-Type', 'application/pdf');
    pdfDoc.info.Title = `Reporte de Código ${type}`;
    pdfDoc.pipe(response);
    pdfDoc.end();
  }

  @Get(':id')
  @Auth(...operatorAccess)
  findOne(@Param('id') id: string) {
    return this.emergencyCodesService.findOne(id);
  }

  @Patch(':id')
  @Auth(...operatorAccess)
  update(
    @Param('id') id: string,
    @Body() updateEmergencyCodeDto: UpdateEmergencyCodeDto,
  ) {
    return this.emergencyCodesService.update(id, updateEmergencyCodeDto);
  }
}
