import { format } from '@formkit/tempo';

export class CodeBlueEntity {
  public constructor(
    public id: string,
    public activeBy: string,
    public createdAt: string | Date,
    public location: string,
    public operator: string,
    public team: string,
  ) {}

  public static fromObject(dto: CodeBlueEntity): CodeBlueEntity {
    const codeBlue = new CodeBlueEntity(
      dto.id,
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.operator,
      dto.team,
    );

    return {
      ...codeBlue,
      createdAt: format(new Date(codeBlue.createdAt), {
        date: 'short',
        time: 'short',
      }),
    };
  }
}
