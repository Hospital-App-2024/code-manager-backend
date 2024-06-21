import { format } from '@formkit/tempo';

export class CodeGreenEntity {
  public constructor(
    public id: string,
    public activeBy: string,
    public createdAt: string | Date,
    public location: string,
    public event: string,
    public operator: string,
    public police: string | boolean,
  ) {}

  public static fromObject(dto: CodeGreenEntity): CodeGreenEntity {
    const codeGreen = new CodeGreenEntity(
      dto.id,
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.event,
      dto.operator,
      dto.police,
    );

    return {
      ...codeGreen,
      police: codeGreen.police ? 'Si' : 'No',
      createdAt: format(new Date(codeGreen.createdAt), {
        date: 'short',
        time: 'short',
      }),
    };
  }
}
