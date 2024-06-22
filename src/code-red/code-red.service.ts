import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeRedDto } from './dto/create-code-red.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { PrismaService } from 'src/prisma/prisma.service';
import { createPagination } from 'src/common/helper/createPagination';
import { CodeRedEntity } from './entities/code-red.entity';
import { OperatorService } from 'src/operator/operator.service';

@Injectable()
export class CodeRedService {
  public constructor(
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
}
