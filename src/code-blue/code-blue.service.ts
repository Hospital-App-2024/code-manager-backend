import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrinterService } from 'src/printer/printer.service';
import { CodeBlueEntity } from './entities/code-blue.entity';
import { OperatorService } from 'src/operator/operator.service';
import { createPagination } from 'src/common/helper/createPagination';
import { CodeReport } from 'src/pdfTemplates/code.report';

@Injectable()
export class CodeBlueService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly printerService: PrinterService,
    private readonly operatorService: OperatorService,
  ) {}

  public async create(createCodeBlueDto: CreateCodeBlueDto) {
    const operator = await this.operatorService.findOne(
      createCodeBlueDto.operatorId,
    );

    if (!operator) {
      throw new BadRequestException('Operator not found');
    }

    const codeBlue = await this.prismaService.codeBlue.create({
      data: createCodeBlueDto,
      include: {
        operator: true,
      },
    });

    return CodeBlueEntity.fromObject(codeBlue);
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const countCodeBlue = await this.prismaService.codeBlue.count();

    const codeBlue = await this.prismaService.codeBlue.findMany({
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
      data: CodeBlueEntity.mapFromArray(codeBlue),
      meta: createPagination({
        page: paginationAndFilterDto.page,
        take: paginationAndFilterDto.limit,
        count: countCodeBlue,
      }),
    };
  }

  public async generatePdf() {
    const data = await this.prismaService.codeBlue.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        operator: true,
      },
    });

    const codeBlue = CodeBlueEntity.mapFromArray(data);

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title: 'Reporte de Código Azul',
        columnNames: [
          'Fecha/Hora',
          'Equipo',
          'Ubicación',
          'Activo por',
          'Operador',
        ],
        columnItems: codeBlue.map((item) => [
          item.createdAt,
          item.team,
          item.location,
          item.activeBy,
          item.operator,
        ]),
        widths: ['*', '*', 200, '*', '*'],
      }),
    });

    return doc;
  }
}
