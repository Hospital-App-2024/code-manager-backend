import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationAndFilterDto } from '../common/dto/paginationAndFilter';
import { createPagination } from 'src/common/helper/createPagination';

@Injectable()
export class OperatorService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(createOperatorDto: CreateOperatorDto) {
    return await this.prismaService.operator.create({
      data: {
        name: createOperatorDto.name,
      },
    });
  }

  public async findAll() {
    return await this.prismaService.operator.findMany();
  }

  public async findAllWithPagination(
    paginationAndFilterDto: PaginationAndFilterDto,
  ) {
    const { page, limit } = paginationAndFilterDto;

    const countOperators = await this.prismaService.operator.count();

    console.log(countOperators);

    const operators = await this.prismaService.operator.findMany({
      take: paginationAndFilterDto.limit,
      skip: paginationAndFilterDto.limit * (paginationAndFilterDto.page - 1),
      orderBy: {
        name: 'asc',
      },
    });

    return {
      data: operators,
      meta: createPagination({
        page: page,
        take: limit,
        count: countOperators,
      }),
    };
  }

  public async findOne(id: string) {
    const operator = await this.prismaService.operator.findUnique({
      where: {
        id: id,
      },
    });

    if (!operator) {
      throw new NotFoundException(`Operador com id ${id} no encontrado`);
    }

    return operator;
  }
}
