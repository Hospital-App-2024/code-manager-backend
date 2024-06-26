import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from 'src/operator/operator.service';
import { CodeAirEntity } from './entities/code-air.entity';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { createPagination } from 'src/common/helper/createPagination';
import { statisticMonths } from 'src/common/helper/statisticMonths';
import { PrinterService } from 'src/printer/printer.service';
import { CodeReport } from 'src/pdfTemplates/code.report';

@Injectable()
export class CodeAirService {
  public constructor(
    private readonly printerService: PrinterService,
    private readonly prismaService: PrismaService,
    private readonly operatorService: OperatorService,
  ) {}

  public async create(createCodeAirDto: CreateCodeAirDto) {
    const operator = await this.operatorService.findOne(
      createCodeAirDto.operatorId,
    );

    if (!operator) {
      throw new BadRequestException('Operator not found');
    }

    const codeAir = await this.prismaService.codeAir.create({
      data: createCodeAirDto,
      include: {
        operator: true,
      },
    });

    return CodeAirEntity.fromEntity(codeAir);
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const countCodeAir = await this.prismaService.codeAir.count({});

    const codeAir = await this.prismaService.codeAir.findMany({
      take: paginationAndFilterDto?.limit,
      skip: paginationAndFilterDto?.limit * (paginationAndFilterDto.page - 1),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    return {
      data: CodeAirEntity.mapFromArray(codeAir),
      meta: createPagination({
        page: paginationAndFilterDto.page,
        take: paginationAndFilterDto.limit,
        count: countCodeAir,
      }),
    };
  }

  public async generatePdf() {
    const data = await this.prismaService.codeAir.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    const codeRed = CodeAirEntity.mapFromArray(data);

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title: 'Reporte de Código Aéreo',
        columnNames: [
          'Fecha/Hora',
          'Lugar de la emergencia',
          'Detalle de la emergencia',
          'Activo por',
          'Operador',
        ],
        columnItems: codeRed.map((item) => [
          item.createdAt,
          item.location,
          item.emergencyDetail,
          item.activeBy,
          item.operator,
        ]),
        widths: ['*', 200, 200, '*', '*'],
      }),
    });

    return doc;
  }

  public async findMonthly() {
    const data = await this.prismaService.codeAir.groupBy({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
      by: ['createdAt'],
      _count: true,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return statisticMonths(data);
  }
}
