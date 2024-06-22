import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOperatorDto } from './dto/create-operator.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
