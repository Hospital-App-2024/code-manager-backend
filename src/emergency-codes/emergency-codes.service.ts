import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OperatorService } from '../operator/operator.service';
import { CreateEmergencyCodeDto } from './dto/create-emergency-code.dto';
import { UpdateEmergencyCodeDto } from './dto/update-emergency-code.dto';
import { PaginationAndFilterDto } from '../common/dto/paginationAndFilter';
import { createPagination } from '../common/helper/createPagination';
import { statisticMonths } from '../common/helper/statisticMonths';
import { PrinterService } from '../printer/printer.service';
import { CodeReport } from '../pdfTemplates/code.report';
import { CodeType } from '@prisma/client';
import { validateEmergencyCodeState } from './domain/emergency-code-invariants';
import { formatBlueTeams } from './domain/blue-team-labels';

const withOperators = { operator: true, closedByOperator: true } as const;

@Injectable()
export class EmergencyCodesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly operatorService: OperatorService,
    private readonly printerService: PrinterService,
  ) {}

  public async create(createEmergencyCodeDto: CreateEmergencyCodeDto) {
    await this.ensureOperatorExists(
      createEmergencyCodeDto.operatorId,
      'Operator not found',
    );

    if (createEmergencyCodeDto.closedByOperatorId) {
      await this.ensureOperatorExists(
        createEmergencyCodeDto.closedByOperatorId,
        'Closing operator not found',
      );
    }

    validateEmergencyCodeState(createEmergencyCodeDto);

    const emergencyCode = await this.prismaService.emergencyCode.create({
      data: createEmergencyCodeDto,
      include: withOperators,
    });

    return emergencyCode;
  }

  public async findAll(
    paginationAndFilterDto: PaginationAndFilterDto,
    type?: CodeType,
  ) {
    const { from, to, limit, page } = paginationAndFilterDto;

    const whereCondition = {
      ...(type && { type }),
      activationTime: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined,
      },
    };

    const count = await this.prismaService.emergencyCode.count({
      where: whereCondition,
    });

    const emergencyCodes = await this.prismaService.emergencyCode.findMany({
      where: whereCondition,
      take: limit,
      skip: limit && page ? limit * (page - 1) : undefined,
      orderBy: {
        activationTime: 'desc',
      },
      include: withOperators,
    });

    return {
      data: emergencyCodes,
      meta: createPagination({
        page: page,
        take: limit,
        count: count,
      }),
    };
  }

  public async findOne(id: string) {
    const emergencyCode = await this.prismaService.emergencyCode.findUnique({
      where: { id },
      include: withOperators,
    });

    if (!emergencyCode) {
      throw new BadRequestException('Emergency Code not found');
    }

    return emergencyCode;
  }

  public async update(
    id: string,
    updateEmergencyCodeDto: UpdateEmergencyCodeDto,
  ) {
    const existing = await this.findOne(id);

    if (existing.closedAt) {
      throw new BadRequestException('Emergency Code is already closed');
    }

    if (updateEmergencyCodeDto.closedByOperatorId) {
      await this.ensureOperatorExists(
        updateEmergencyCodeDto.closedByOperatorId,
        'Closing operator not found',
      );
    }

    validateEmergencyCodeState({
      ...existing,
      ...updateEmergencyCodeDto,
    });

    try {
      const updated = await this.prismaService.emergencyCode.update({
        where: { id },
        data: updateEmergencyCodeDto,
        include: withOperators,
      });
      return updated;
    } catch (error) {
      throw new BadRequestException('Error updating emergency code');
    }
  }

  public async findMonthly(type?: CodeType) {
    const data = await this.prismaService.emergencyCode.findMany({
      where: {
        ...(type && { type }),
        activationTime: {
          gte: new Date(new Date().getFullYear(), 0, 1),
          lte: new Date(new Date().getFullYear(), 11, 31),
        },
      },
      select: {
        activationTime: true,
      },
      orderBy: {
        activationTime: 'asc',
      },
    });

    return statisticMonths(
      data.map(({ activationTime }) => ({ createdAt: activationTime })),
    );
  }

  public async generatePdf(type: CodeType) {
    const data = await this.prismaService.emergencyCode.findMany({
      where: { type },
      orderBy: { activationTime: 'desc' },
      include: { operator: true },
    });

    let title = 'Reporte de Emergencias';
    let columnNames: string[] = [];
    let columnItems: any[] = [];
    let widths: any[] = [];

    switch (type) {
      case CodeType.GREEN:
        title = 'Reporte de Código Verde';
        columnNames = [
          'Fecha/Hora',
          'Carabineros',
          'Ubicación',
          'Evento',
          'Activo por',
          'Operador',
        ];
        widths = ['auto', 'auto', '*', '*', 'auto', 'auto'];
        columnItems = data.map((item) => [
          item.activationTime.toLocaleString(),
          item.police ? 'Sí' : 'No',
          item.location,
          item.event,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.BLUE:
        title = 'Reporte de Código Azul';
        columnNames = [
          'Fecha/Hora',
          'Equipo',
          'Ubicación',
          'Activo por',
          'Operador',
        ];
        widths = ['*', '*', 200, '*', '*'];
        columnItems = data.map((item) => [
          item.activationTime.toLocaleString(),
          formatBlueTeams(item.teams),
          item.location,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.AIR:
        title = 'Reporte de Código Aéreo';
        columnNames = [
          'Fecha/Hora',
          'Lugar',
          'Detalle',
          'Activo por',
          'Operador',
        ];
        widths = ['*', 200, 200, '*', '*'];
        columnItems = data.map((item) => [
          item.activationTime.toLocaleString(),
          item.location,
          item.emergencyDetail,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.RED:
        title = 'Reporte de Código Rojo';
        columnNames = [
          'Fecha/Hora',
          'COGRID',
          'Hora COGRID',
          'Hora Bomberos',
          'Ubicación',
          'Activo por',
          'Operador',
        ];
        widths = ['*', 'auto', '*', '*', '*', '*', '*'];
        columnItems = data.map((item) => [
          item.activationTime.toLocaleString(),
          item.cogridNotified ? 'Sí' : 'No',
          item.cogridNotifiedAt?.toLocaleString() || 'N/A',
          item.firefighterCalledTime?.toLocaleString() || 'N/A',
          item.location,
          item.activeBy,
          item.operator.name,
        ]);
        break;
      case CodeType.LEAK:
        title = 'Reporte de Código de Fuga';
        columnNames = [
          'Fecha/Hora',
          'Descripción paciente',
          'Ubicación',
          'Activo por',
          'Operador',
        ];
        widths = ['*', 200, '*', '*', '*'];
        columnItems = data.map((item) => [
          item.activationTime.toLocaleString(),
          item.patientDescription,
          item.location,
          item.activeBy,
          item.operator.name,
        ]);
        break;
    }

    const doc = this.printerService.createPdf({
      docDefinitions: CodeReport({
        title,
        columnNames,
        columnItems,
        widths,
      }),
    });

    return doc;
  }

  private async ensureOperatorExists(
    operatorId: string,
    message: string,
  ): Promise<void> {
    const operator = await this.operatorService.findOne(operatorId);

    if (!operator) {
      throw new BadRequestException(message);
    }
  }
}
