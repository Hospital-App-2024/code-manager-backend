import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from 'src/operator/operator.service';
import { CodeAirEntity } from './entities/code-air.entity';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { createPagination } from 'src/common/helper/createPagination';

@Injectable()
export class CodeAirService {
  public constructor(
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
}
