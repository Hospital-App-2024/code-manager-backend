import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationAndFilterDto } from '../common/dto/paginationAndFilter';
import { createPagination } from 'src/common/helper/createPagination';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async create(createUserDto: CreateUserDto) {
    const emailExists = await this.findOneByEmail(createUserDto.email);

    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }

    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: bcryptjs.hashSync(createUserDto.password),
      },
    });

    return UserEntity.fromObject(user);
  }

  public async findAll(paginationAndFilterDto: PaginationAndFilterDto) {
    const countUser = await this.prismaService.user.count();

    const users = await this.prismaService.user.findMany({
      take: paginationAndFilterDto?.limit,
      skip: paginationAndFilterDto?.limit * (paginationAndFilterDto.page - 1),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      data: UserEntity.mapFromArray(users),
      meta: createPagination({
        page: paginationAndFilterDto.page,
        take: paginationAndFilterDto.limit,
        count: countUser,
      }),
    };
  }

  public async findOneByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    return user;
  }

  public findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
