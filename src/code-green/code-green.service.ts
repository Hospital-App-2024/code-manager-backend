import { Injectable } from '@nestjs/common';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodeGreenEntity } from './entities/code-green.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { PrinterService } from 'src/printer/printer.service';
import { CodeGreenReport } from 'src/pdfTemplates/codeGreen.report';

@Injectable()
export class CodeGreenService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly printerService: PrinterService,
  ) {}

  public async create(createCodeGreenDto: CreateCodeGreenDto) {
    const codeGreen = await this.prismaService.codeGreen.create({
      data: createCodeGreenDto,
      include: {
        operator: {
          select: {
            name: true,
          },
        },
      },
    });

    return CodeGreenEntity.fromObject({
      ...codeGreen,
      operator: codeGreen.operator.name,
    });
  }

  public async findAll(paginationDto: PaginationDto) {
    const totalPages = await this.prismaService.codeGreen.count();

    const currentPage = paginationDto.page;
    const perPage = paginationDto.limit;

    const codeGreens = await this.prismaService.codeGreen.findMany({
      skip: (currentPage - 1) * perPage,
      take: perPage,
      include: {
        operator: true,
      },
    });

    return {
      data: codeGreens.map((codeGreen) =>
        CodeGreenEntity.fromObject({
          ...codeGreen,
          operator: codeGreen.operator.name,
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
    const codeGreens = await this.prismaService.codeGreen.findMany({
      include: {
        operator: true,
      },
    });

    const doc = this.printerService.createPdf({
      docDefinitions: CodeGreenReport({
        greenCodes: codeGreens.map((codeGreen) =>
          CodeGreenEntity.fromObject({
            ...codeGreen,
            operator: codeGreen.operator.name,
          }),
        ),
      }),
    });

    return doc;
  }
}
