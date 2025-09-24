import { Role } from '@prisma/client';

export const basicAccess = [Role.Admin, Role.Operator, Role.User];
export const operatorAccess = [Role.Admin, Role.Operator];
export const adminAccess = [Role.Admin];
