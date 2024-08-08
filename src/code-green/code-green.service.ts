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
import { UpdateCodeGreenDto } from './dto/update-code-green.dto';

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

    return CodeGreenEntity.fromObject({ codeGreen });
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const totalPages = await this.prismaService.codeGreen.count();
    const codeGreens = await this.prismaService.codeGreen.findMany({
      where: {
        createdAt: {
          gte:
            paginationAndFilterDto?.from &&
            new Date(paginationAndFilterDto?.from),
          lte:
            paginationAndFilterDto?.to && new Date(paginationAndFilterDto?.to),
        },
      },
      take: paginationAndFilterDto?.limit,
      skip:
        paginationAndFilterDto.limit &&
        paginationAndFilterDto?.limit * (paginationAndFilterDto.page - 1),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    return {
      data: CodeGreenEntity.mapFromArray(
        codeGreens.map((codeGreen) => ({ codeGreen })),
      ),
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

  public async generatePdf(paginationAndFilterDto: PaginationAndFilterDto) {
    const { data: codeGreens } = await this.findAll(paginationAndFilterDto);

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title: 'Reporte de Código Verde',
        subtitle: `Total de registros: ${codeGreens.length}, Abiertos: ${codeGreens.filter((code) => !code.isClosed).length}, Cerrados: ${codeGreens.filter((code) => code.isClosed).length}`,
        widths: [
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          'auto',
          '*',
          '*',
          'auto',
        ],
        columnNames: [
          'Focha',
          'Hora de Activación',
          'Hora de Finalización',
          'Activado por',
          'Desactivado por',
          'Carabineros',
          'Ubicación',
          'Evento',
          'Operador',
        ],
        columnItems: codeGreens.map((codeGreen) => [
          codeGreen.createdAt.split(',')[0],
          codeGreen.createdAt.split(',')[1],
          codeGreen?.closedAt?.split(',')[1] || '',
          codeGreen.activeBy,
          codeGreen.closedBy || '',
          codeGreen.police,
          codeGreen.location,
          codeGreen.event,
          codeGreen.operator,
        ]),
      }),
    });

    return doc;
  }

  public async findOne(id: string) {
    const codeGreen = await this.prismaService.codeGreen.findUnique({
      where: {
        id,
      },
      include: {
        operator: true,
      },
    });

    if (!codeGreen) {
      throw new BadRequestException('Code Green not found');
    }

    return codeGreen;
  }

  public async update(id: string, updateCodeGreenDto: UpdateCodeGreenDto) {
    const isClosed = await this.findOne(id);

    if (isClosed.isClosed)
      throw new BadRequestException('Code Green is already closed');

    try {
      const data = await this.prismaService.codeGreen.update({
        where: {
          id,
        },
        include: {
          operator: true,
        },
        data: updateCodeGreenDto,
      });

      return CodeGreenEntity.fromObject({ codeGreen: data });
    } catch (error) {
      throw new BadRequestException('Error updating user');
    }
  }
}
