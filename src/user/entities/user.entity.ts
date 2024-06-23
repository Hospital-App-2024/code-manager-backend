import { Role } from '@prisma/client';
import { formatDateTime } from 'src/common/helper/formatDateTime';
import { IUser } from 'src/interfaces/user.interface';

export class UserEntity {
  public constructor(
    public createdAt: Date,
    public email: string,
    public id: string,
    public isActive: boolean,
    public name: string,
    public password: string,
    public role: Role,
    public updatedAt: Date,
  ) {}

  public static fromObject(dto: UserEntity): IUser {
    const user = new UserEntity(
      dto.createdAt,
      dto.email,
      dto.id,
      dto.isActive,
      dto.name,
      dto.password,
      dto.role,
      dto.updatedAt,
    );

    return {
      ...user,
      password: null,
      createdAt: formatDateTime(user.createdAt),
      updatedAt: formatDateTime(user.updatedAt),
    };
  }

  public static mapFromArray(dtos: UserEntity[]): IUser[] {
    return dtos.map((dto) => UserEntity.fromObject(dto));
  }
}
