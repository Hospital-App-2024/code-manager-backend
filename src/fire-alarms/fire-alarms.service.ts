import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFireAlarmDto } from './dto/create-fire-alarm.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNodoDto, CreateTypeDeviceDto } from './dto';
import { PaginationAndNodoDto } from 'src/common/dto/paginationAndNodo';
import { DeviceEntity } from './entities/device.entity';
import { createPagination } from 'src/common/helper/createPagination';

@Injectable()
export class FireAlarmsService {
  public constructor(private readonly prismaService: PrismaService) {}

  public async createTypeDevice(createTypeDeviceDto: CreateTypeDeviceDto) {
    return this.prismaService.typeDevice.create({ data: createTypeDeviceDto });
  }

  public async findAllTypeDevices() {
    return this.prismaService.typeDevice.findMany();
  }

  public async findTypeDeviceById(id: string) {
    const typeDevice = await this.prismaService.typeDevice.findUnique({
      where: { id },
    });

    if (!typeDevice) {
      throw new NotFoundException(`Type device with id ${id} not found`);
    }

    return typeDevice;
  }

  public async createNodo(createNodoDto: CreateNodoDto) {
    return this.prismaService.nodo.create({ data: createNodoDto });
  }

  public async findAllNodos() {
    return this.prismaService.nodo.findMany();
  }

  public async findNodoById(id: string) {
    const nodo = await this.prismaService.nodo.findUnique({
      where: { id },
    });

    if (!nodo) {
      throw new NotFoundException(`Nodo with id ${id} not found`);
    }

    return nodo;
  }

  public async create(createFireAlarmDto: CreateFireAlarmDto) {
    await this.findNodoById(createFireAlarmDto.nodoId);
    await this.findTypeDeviceById(createFireAlarmDto.typeDeviceId);

    return this.prismaService.device.create({ data: createFireAlarmDto });
  }

  public async findAll(paginationAndNodoDto: PaginationAndNodoDto) {
    console.log(paginationAndNodoDto);

    const countDevice = await this.prismaService.device.count({
      where: {
        AND: [
          {
            device: {
              contains: paginationAndNodoDto?.search,
              mode: 'insensitive',
            },
            nodoId: {
              equals: paginationAndNodoDto?.nodo,
              mode: 'insensitive',
            },
          },
        ],
      },
    });
    const device = await this.prismaService.device.findMany({
      where: {
        AND: [
          {
            device: {
              contains: paginationAndNodoDto?.search,
              mode: 'insensitive',
            },
            nodoId: {
              equals: paginationAndNodoDto?.nodo,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: paginationAndNodoDto.limit,
      skip: paginationAndNodoDto.limit * (paginationAndNodoDto.page - 1),
      orderBy: {
        nodo: {
          building: 'asc',
        },
      },
      include: {
        nodo: true,
        typeDevice: true,
      },
    });

    return {
      data: DeviceEntity.mapFromArray(device),
      meta: createPagination({
        page: paginationAndNodoDto.page,
        take: paginationAndNodoDto.limit,
        count: countDevice,
      }),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} fireAlarm`;
  }
}
