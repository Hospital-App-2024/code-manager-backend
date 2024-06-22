import { Operator } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';
import { ICodeGreen } from 'src/interfaces/code-green.interface';

export class CodeGreenEntity {
  public constructor(
    public activeBy: string,
    public createdAt: Date,
    public event: string,
    public id: string,
    public location: string,
    public operator: Operator,
    public police: boolean,
  ) {}

  public static fromObject(dto: CodeGreenEntity): ICodeGreen {
    const codeGreen = new CodeGreenEntity(
      dto.activeBy,
      dto.createdAt,
      dto.event,
      dto.id,
      dto.location,
      dto.operator,
      dto.police,
    );

    return {
      ...codeGreen,
      police: codeGreen.police ? 'Si' : 'No',
      operator: codeGreen.operator.name,
      createdAt: formatDateTime(codeGreen.createdAt),
    };
  }

  public static mapFromArray(dtos: CodeGreenEntity[]): ICodeGreen[] {
    return dtos.map((dto) => CodeGreenEntity.fromObject(dto));
  }
}
