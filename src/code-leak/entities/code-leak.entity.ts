import { Operator } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';
import { type ICodeLeak } from 'src/interfaces/code-leak.interface';

export class CodeLeakEntity {
  public constructor(
    public id: string,
    public activeBy: string,
    public createdAt: Date,
    public location: string,
    public operator: Operator,
    public patientDescription: string,
  ) {}

  public static fromObject(dto: CodeLeakEntity): ICodeLeak {
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
      operator: codeLeak.operator.name,
      createdAt: formatDateTime(codeLeak.createdAt),
    };
  }

  public static mapFromArray(dtos: CodeLeakEntity[]): ICodeLeak[] {
    return dtos.map((dto) => CodeLeakEntity.fromObject(dto));
  }
}
