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
    public patientName?: string,
    public patientDescription?: string,
  ) {}

  public static fromObject(dto: CodeLeakEntity): ICodeLeak {
    const codeLeak = new CodeLeakEntity(
      dto.id,
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.operator,
      dto.patientName,
      dto.patientDescription,
    );

    return {
      ...codeLeak,
      operator: codeLeak.operator.name,
      createdAt: formatDateTime(codeLeak.createdAt),
      patientName: codeLeak.patientName ?? '',
      patientDescription: codeLeak.patientDescription ?? '',
    };
  }

  public static mapFromArray(dtos: CodeLeakEntity[]): ICodeLeak[] {
    return dtos.map((dto) => CodeLeakEntity.fromObject(dto));
  }
}
