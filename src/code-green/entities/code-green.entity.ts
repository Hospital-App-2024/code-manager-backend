export class CodeGreenEntity {
  public constructor(
    public activeBy: string,
    public createdAt: Date,
    public location: string,
    public event: string,
    public operator: string,
  ) {}

  public static fromObject(dto: CodeGreenEntity): CodeGreenEntity {
    return new CodeGreenEntity(
      dto.activeBy,
      dto.createdAt,
      dto.location,
      dto.event,
      dto.operator,
    );
  }
}
