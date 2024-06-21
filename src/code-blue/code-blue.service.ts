import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrinterService } from 'src/printer/printer.service';
import { CodeBlueEntity } from './entities/code-blue.entity';
import { OperatorService } from 'src/operator/operator.service';
import { CodeBlueReport } from 'src/pdfTemplates/codeBlue.report';

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
        operator: {
          select: {
            name: true,
          },
        },
      },
    });

    return CodeBlueEntity.fromObject({
      ...codeBlue,
      operator: codeBlue.operator.name,
    });
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const totalPages = await this.prismaService.codeBlue.count();

    const currentPage = paginationAndFilterDto.page;
    const perPage = paginationAndFilterDto.limit;

    const codeBlue = await this.prismaService.codeBlue.findMany({
      skip: (currentPage - 1) * perPage,
      take: perPage,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        createdAt: {
          gte: paginationAndFilterDto.from,
          lte: paginationAndFilterDto.to,
        },
      },
      include: {
        operator: true,
      },
    });

    return {
      data: codeBlue.map((codeBlue) =>
        CodeBlueEntity.fromObject({
          ...codeBlue,
          operator: codeBlue.operator.name,
        }),
      ),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil(totalPages / perPage),
        nextPage:
          currentPage + 1 <= Math.ceil(totalPages / perPage)
            ? currentPage + 1
            : null,
        prevPage: currentPage - 1 > 0 ? currentPage - 1 : null,
      },
    };
  }

  public async generatePdf() {
    const codeBlue = await this.prismaService.codeBlue.findMany({
      include: {
        operator: true,
      },
    });

    const doc = this.printerService.createPdf({
      docDefinitions: CodeBlueReport({
        codeBlue: codeBlue.map((codeBlue) =>
          CodeBlueEntity.fromObject({
            ...codeBlue,
            operator: codeBlue.operator.name,
          }),
        ),
      }),
    });

    return doc;
  }

  findOne(id: number) {
    return `This action returns a #${id} codeBlue`;
  }

  remove(id: number) {
    return `This action removes a #${id} codeBlue`;
  }
}
