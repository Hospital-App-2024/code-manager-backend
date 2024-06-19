import { Injectable } from '@nestjs/common';
import { CreateCodeGreenDto } from './dto/create-code-green.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CodeGreenEntity } from './entities/code-green.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CodeGreenService {
  public constructor(private readonly prismaService: PrismaService) {}

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
}
