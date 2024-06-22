import { Operator } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';
import { ICodeAir } from 'src/interfaces/code-air.interface';

export class CodeAirEntity {
  public constructor(
    public activeBy: string,
    public createdAt: Date,
    public id: string,
    public location: string,
    public operator: Operator,
    public emergencyDetail: string,
  ) {}

  public static fromEntity(entity: CodeAirEntity): ICodeAir {
    const codeAir = new CodeAirEntity(
      entity.activeBy,
      entity.createdAt,
      entity.id,
      entity.location,
      entity.operator,
      entity.emergencyDetail,
    );

    return {
      ...codeAir,
      createdAt: formatDateTime(codeAir.createdAt),
      operator: codeAir.operator.name,
    };
  }

  public static mapFromArray(dtos: CodeAirEntity[]): ICodeAir[] {
    return dtos.map((dto) => CodeAirEntity.fromEntity(dto));
  }
}
