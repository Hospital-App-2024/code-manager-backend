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
    public isClosed: boolean,
    public observations?: string,
    public closedBy?: string,
    public closedAt?: Date,
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
      dto.isClosed,
      dto?.observations,
      dto?.closedBy,
      dto?.closedAt,
    );

    return {
      ...codeGreen,
      police: codeGreen.police ? 'Si' : 'No',
      operator: codeGreen.operator.name,
      createdAt: formatDateTime(codeGreen.createdAt),
      isClosed: codeGreen.isClosed ? 'Si' : 'No',
      closedAt: codeGreen.closedAt ? formatDateTime(codeGreen.closedAt) : null,
    };
  }

  public static mapFromArray(dtos: CodeGreenEntity[]): ICodeGreen[] {
    return dtos.map((dto) => CodeGreenEntity.fromObject(dto));
  }
}
