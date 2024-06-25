import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeRedDto } from './dto/create-code-red.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPagination } from 'src/common/helper/createPagination';
import { CodeRedEntity } from './entities/code-red.entity';
import { OperatorService } from 'src/operator/operator.service';
import { statisticMonths } from 'src/common/helper/statisticMonths';
import { PrinterService } from 'src/printer/printer.service';
import { CodeReport } from 'src/pdfTemplates/code.report';

@Injectable()
export class CodeRedService {
  public constructor(
    private readonly printerService: PrinterService,
    private readonly prismaService: PrismaService,
    private readonly operatorService: OperatorService,
  ) {}

  public async create(createCodeRedDto: CreateCodeRedDto) {
    const operator = await this.operatorService.findOne(
      createCodeRedDto.operatorId,
    );

    if (!operator) {
      throw new BadRequestException('Operator not found');
    }

    const codeRed = await this.prismaService.codeRed.create({
      data: createCodeRedDto,
      include: {
        operator: true,
      },
    });

    return CodeRedEntity.fromObject(codeRed);
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const countCodeRed = await this.prismaService.codeRed.count({});
    const codeRed = await this.prismaService.codeRed.findMany({
      take: paginationAndFilterDto.limit,
      skip: paginationAndFilterDto.limit * (paginationAndFilterDto.page - 1),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    return {
      data: CodeRedEntity.mapFromArray(codeRed),
      meta: createPagination({
        page: paginationAndFilterDto.page,
        take: paginationAndFilterDto.limit,
        count: countCodeRed,
      }),
    };
  }

  public async findMonthly() {
    const data = await this.prismaService.codeRed.groupBy({
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

  public async generatePdf() {
    const data = await this.prismaService.codeRed.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    const codeRed = CodeRedEntity.mapFromArray(data);

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title: 'Reporte de Código Rojo',
        columnNames: [
          'Fecha/Hora',
          'Comunicación con COGRID',
          'Hora de llamada a bomberos',
          'Ubicación',
          'Activo por',
          'Operador',
        ],
        columnItems: codeRed.map((item) => [
          item.createdAt,
          item.COGRID,
          item.firefighterCalledTime,
          item.location,
          item.activeBy,
          item.operator,
        ]),
        widths: ['*', 'auto', '*', '*', '*', '*'],
      }),
    });

    return doc;
  }
}
