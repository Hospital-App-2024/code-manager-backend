import { Operator } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';
import { ICodeGreen } from 'src/interfaces/code-green.interface';

interface CodeGreenProps {
  activeBy: string;
  createdAt: Date;
  event: string;
  id: string;
  isClosed: boolean;
  location: string;
  operator: Operator;
  police: boolean;
  closedAt?: Date;
  closedBy?: string;
  observations?: string;
}

export class CodeGreenEntity {
  public constructor(public codeGreen: CodeGreenProps) {}

  public static fromObject(dto: CodeGreenEntity): ICodeGreen {
    const { codeGreen } = new CodeGreenEntity(dto.codeGreen);

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
