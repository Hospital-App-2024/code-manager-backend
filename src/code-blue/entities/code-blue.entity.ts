import { Operator } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';
import { ICodeBlue } from 'src/interfaces/code-blue.interface';

export class CodeBlueEntity {
  public constructor(
    public activeBy: string,
    public createdAt: Date,
    public id: string,
    public location: string,
    public operator: Operator,
    public team: string,
  ) {}

  public static fromObject(dto: CodeBlueEntity): ICodeBlue {
    const codeBlue = new CodeBlueEntity(
      dto.activeBy,
      dto.createdAt,
      dto.id,
      dto.location,
      dto.operator,
      dto.team,
    );

    return {
      ...codeBlue,
      operator: codeBlue.operator.name,
      createdAt: formatDateTime(codeBlue.createdAt),
    };
  }

  public static mapFromArray(dtos: CodeBlueEntity[]): ICodeBlue[] {
    return dtos.map((dto) => CodeBlueEntity.fromObject(dto));
  }
}
