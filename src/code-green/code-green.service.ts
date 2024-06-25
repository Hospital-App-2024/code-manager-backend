import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodeGreenEntity } from './entities/code-green.entity';
import { PrinterService } from 'src/printer/printer.service';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { OperatorService } from 'src/operator/operator.service';
import { createPagination } from 'src/common/helper/createPagination';
import { CodeReport } from 'src/pdfTemplates/code.report';
import { statisticMonths } from 'src/common/helper/statisticMonths';

@Injectable()
export class CodeGreenService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly operatorService: OperatorService,
    private readonly printerService: PrinterService,
  ) {}

  public async create(createCodeGreenDto: CreateCodeGreenDto) {
    const operator = await this.operatorService.findOne(
      createCodeGreenDto.operatorId,
    );

    if (!operator) {
      throw new BadRequestException('Operator not found');
    }

    const codeGreen = await this.prismaService.codeGreen.create({
      data: createCodeGreenDto,
      include: {
        operator: true,
      },
    });

    return CodeGreenEntity.fromObject(codeGreen);
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const totalPages = await this.prismaService.codeGreen.count();
    const codeGreens = await this.prismaService.codeGreen.findMany({
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
      data: CodeGreenEntity.mapFromArray(codeGreens),
      meta: createPagination({
        page: paginationAndFilterDto.page,
        take: paginationAndFilterDto.limit,
        count: totalPages,
      }),
    };
  }

  public async findMonthly() {
    const data = await this.prismaService.codeGreen.groupBy({
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
    const data = await this.prismaService.codeGreen.findMany({
      include: {
        operator: true,
      },
    });

    const codeGreens = CodeGreenEntity.mapFromArray(data);

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title: 'Reporte de Código Verde',
        widths: ['*', '*', '*', 'auto', 150, '*'],
        columnNames: [
          'Fecha/hora',
          'Operador',
          'Activo por',
          'Carabineros',
          'Ubicación',
          'Evento',
        ],
        columnItems: codeGreens.map((codeGreen) => [
          codeGreen.createdAt,
          codeGreen.operator,
          codeGreen.activeBy,
          codeGreen.police,
          codeGreen.location,
          codeGreen.event,
        ]),
      }),
    });

    return doc;
  }
}
