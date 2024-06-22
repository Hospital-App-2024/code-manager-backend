import { Injectable } from '@nestjs/common';
import { CreateCodeLeakDto } from './dto/create-code-leak.dto';
import { PaginationAndFilterDto } from 'src/common/dto/paginationAndFilter';
import { PrismaService } from 'src/prisma/prisma.service';
import { OperatorService } from 'src/operator/operator.service';
import { CodeLeakEntity } from './entities/code-leak.entity';
import { createPagination } from 'src/common/helper/createPagination';

@Injectable()
export class CodeLeakService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly operatorService: OperatorService,
  ) {}

  public async create(createCodeLeakDto: CreateCodeLeakDto) {
    await this.operatorService.findOne(createCodeLeakDto.operatorId);

    const codeLeak = await this.prismaService.codeLeak.create({
      data: createCodeLeakDto,
      include: {
        operator: true,
      },
    });

    return CodeLeakEntity.fromObject(codeLeak);
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const codeLeak = await this.prismaService.codeLeak.findMany({
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
      data: CodeLeakEntity.mapFromArray(codeLeak),
      meta: createPagination({
        page: paginationAndFilterDto.page,
        take: paginationAndFilterDto.limit,
        count: codeLeak.length,
      }),
    };
  }
}
