import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const META_ROLES = 'roles';

// @RoleProtected(Role.ADMIN, Role.USER)
export const RoleProtected = (...args: Role[]) =>
  SetMetadata('role-protected', args);
