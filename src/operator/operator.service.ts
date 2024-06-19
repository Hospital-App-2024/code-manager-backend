import { Injectable } from '@nestjs/common';
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

  findAll() {
    return `This action returns all operator`;
  }

  findOne(id: number) {
    return `This action returns a #${id} operator`;
  }
}
