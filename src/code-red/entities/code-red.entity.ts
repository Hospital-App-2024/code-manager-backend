import { Operator } from '@prisma/client';
import { formatDateTime, formatTime } from 'src/common/helper/formatDateTime';
import { ICodeRed } from 'src/interfaces/code-red.interface';

export class CodeRedEntity {
  public constructor(
    public id: string,
    public activeBy: string,
    public createdAt: Date,
    public location: string,
    public operator: Operator,
    public COGRID: boolean,
    public firefighterCalledTime?: Date,
  ) {}

  public static fromObject(dto: CodeRedEntity): ICodeRed {
    const codeRed = new CodeRedEntity(
      dto.id,
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.operator,
      dto.COGRID,
      dto.firefighterCalledTime,
    );

    return {
      ...codeRed,
      COGRID: codeRed.COGRID ? 'Si' : 'No',
      createdAt: formatDateTime(codeRed.createdAt),
      operator: codeRed.operator.name,
      firefighterCalledTime: codeRed.firefighterCalledTime
        ? formatTime(codeRed.firefighterCalledTime)
        : 'N/A',
    };
  }

  public static mapFromArray(dtos: CodeRedEntity[]): ICodeRed[] {
    return dtos.map((dto) => CodeRedEntity.fromObject(dto));
  }
}
