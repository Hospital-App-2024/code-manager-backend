import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodeGreenEntity } from './entities/code-green.entity';
import { PrinterService } from 'src/printer/printer.service';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { OperatorService } from 'src/operator/operator.service';
import { createPagination } from 'src/common/helper/createPagination';
import { CodeReport } from 'src/pdfTemplates/code.report';

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
        widths: ['*', 'auto', 150, '*', '*', '*'],
        columnNames: [
          'Fecha/Hora',
          'Carabinero',
          'Evento',
          'Ubicación',
          'Activo por',
          'Operador',
        ],
        columnItems: codeGreens.map((codeGreen) => [
          codeGreen.createdAt,
          codeGreen.police,
          codeGreen.event,
          codeGreen.location,
          codeGreen.activeBy,
          codeGreen.operator,
        ]),
      }),
    });

    return doc;
  }
}
