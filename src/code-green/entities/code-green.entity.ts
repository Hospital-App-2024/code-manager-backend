import { format } from '@formkit/tempo';

export class CodeGreenEntity {
  public constructor(
    public activeBy: string,
    public createdAt: string | Date,
    public location: string,
    public event: string,
    public operator: string,
  ) {}

  public static fromObject(dto: CodeGreenEntity): CodeGreenEntity {
    const codeGreen = new CodeGreenEntity(
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.event,
      dto.operator,
    );

    return {
      ...codeGreen,
      createdAt: format(new Date(codeGreen.createdAt), {
        date: 'short',
        time: 'short',
      }),
    };
  }
}
