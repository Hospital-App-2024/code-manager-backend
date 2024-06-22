import { Operator } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';

export class CodeLeakEntity {
  public constructor(
    public id: string,
    public activeBy: string,
    public createdAt: Date,
    public location: string,
    public operator: Operator,
    public patientDescription: string,
  ) {}

  public static fromObject(dto: CodeLeakEntity) {
    const codeLeak = new CodeLeakEntity(
      dto.id,
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.operator,
      dto.patientDescription,
    );

    return {
      ...codeLeak,
      createdAt: formatDateTime(codeLeak.createdAt),
    };
  }

  public static mapFromArray(dtos: CodeLeakEntity[]) {
    return dtos.map((dto) => CodeLeakEntity.fromObject(dto));
  }
}
