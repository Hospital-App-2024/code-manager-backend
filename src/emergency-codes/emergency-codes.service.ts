import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from '../operator/operator.service';
import { CreateEmergencyCodeDto } from './dto/create-emergency-code.dto';
import { UpdateEmergencyCodeDto } from './dto/update-emergency-code.dto';
import { PaginationAndFilterDto } from '../common/dto/paginationAndFilter';
import { createPagination } from '../common/helper/createPagination';
import { statisticMonths } from '../common/helper/statisticMonths';
import { PrinterService } from '../printer/printer.service';
import { CodeReport } from '../pdfTemplates/code.report';
import { CodeType } from '@prisma/client';

@Injectable()
export class EmergencyCodesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly operatorService: OperatorService,
    private readonly printerService: PrinterService,
  ) {}

  public async create(createEmergencyCodeDto: CreateEmergencyCodeDto) {
    const operator = await this.operatorService.findOne(
      createEmergencyCodeDto.operatorId,
    );

    if (!operator) {
      throw new BadRequestException('Operator not found');
    }

    const emergencyCode = await this.prismaService.emergencyCode.create({
      data: createEmergencyCodeDto,
      include: {
        operator: true,
      },
    });

    return emergencyCode;
  }

  public async findAll(
    paginationAndFilterDto: PaginationAndFilterDto,
    type?: CodeType,
  ) {
    const { from, to, limit, page } = paginationAndFilterDto;

    const whereCondition = {
      ...(type && { type }),
      createdAt: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    };

    const count = await this.prismaService.emergencyCode.count({
      where: whereCondition,
    });

    const emergencyCodes = await this.prismaService.emergencyCode.findMany({
      where: whereCondition,
      take: limit,
      skip: limit && page ? limit * (page - 1) : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    return {
      data: emergencyCodes,
      meta: createPagination({
        page: page,
        take: limit,
        count: count,
      }),
    };
  }

  public async findOne(id: string) {
    const emergencyCode = await this.prismaService.emergencyCode.findUnique({
      where: { id },
      include: { operator: true },
    });

    if (!emergencyCode) {
      throw new BadRequestException('Emergency Code not found');
    }

    return emergencyCode;
  }

  public async update(id: string, updateEmergencyCodeDto: UpdateEmergencyCodeDto) {
    const existing = await this.findOne(id);

    if (existing.isClosed) {
      throw new BadRequestException('Emergency Code is already closed');
    }

    try {
      const updated = await this.prismaService.emergencyCode.update({
        where: { id },
        data: updateEmergencyCodeDto,
        include: { operator: true },
      });
      return updated;
    } catch (error) {
      throw new BadRequestException('Error updating emergency code');
    }
  }

  public async findMonthly(type?: CodeType) {
    const data = await this.prismaService.emergencyCode.findMany({
      where: {
        ...(type && { type }),
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return statisticMonths(data);
  }

  public async generatePdf(type: CodeType) {
    const data = await this.prismaService.emergencyCode.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
      include: { operator: true },
    });

    let title = 'Reporte de Emergencias';
    let columnNames: string[] = [];
    let columnItems: any[] = [];
    let widths: any[] = [];

    switch (type) {
      case CodeType.GREEN:
        title = 'Reporte de Código Verde';
        columnNames = ['Fecha/Hora', 'Carabineros', 'Ubicación', 'Evento', 'Activo por', 'Operador'];
        widths = ['auto', 'auto', '*', '*', 'auto', 'auto'];
        columnItems = data.map((item) => [
          item.createdAt.toLocaleString(),
          item.police ? 'Sí' : 'No',
          item.location,
          item.event,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.BLUE:
        title = 'Reporte de Código Azul';
        columnNames = ['Fecha/Hora', 'Equipo', 'Ubicación', 'Activo por', 'Operador'];
        widths = ['*', '*', 200, '*', '*'];
        columnItems = data.map((item) => [
          item.createdAt.toLocaleString(),
          item.team,
          item.location,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.AIR:
        title = 'Reporte de Código Aéreo';
        columnNames = ['Fecha/Hora', 'Lugar', 'Detalle', 'Activo por', 'Operador'];
        widths = ['*', 200, 200, '*', '*'];
        columnItems = data.map((item) => [
          item.createdAt.toLocaleString(),
          item.location,
          item.emergencyDetail,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.RED:
        title = 'Reporte de Código Rojo';
        columnNames = ['Fecha/Hora', 'COGRID', 'Hora Bomberos', 'Ubicación', 'Activo por', 'Operador'];
        widths = ['*', 'auto', '*', '*', '*', '*'];
        columnItems = data.map((item) => [
          item.createdAt.toLocaleString(),
          item.COGRID ? 'Sí' : 'No',
          item.firefighterCalledTime?.toLocaleString() || 'N/A',
          item.location,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.LEAK:
        title = 'Reporte de Código de Fuga';
        columnNames = ['Fecha/Hora', 'Descripción paciente', 'Ubicación', 'Activo por', 'Operador'];
        widths = ['*', 200, '*', '*', '*'];
        columnItems = data.map((item) => [
          item.createdAt.toLocaleString(),
          item.patientDescription,
          item.location,
          item.activeBy,
          item.operator.name,
        ]);
        break;
    }

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title,
        columnNames,
        columnItems,
        widths,
      }),
    });

    return doc;
  }
}
