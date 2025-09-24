import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Role } from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('PrismaService');

  public async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to the database');

    const existingUsers = await this.user.findMany();

    if (existingUsers.length === 0) {
      this.logger.log('Creating default user');
      await this.user.create({
        data: {
          email: 'prueba@gmail.com',
          password: bcryptjs.hashSync('prueba'),
          name: 'prueba',
          role: Role.Admin,
          isActive: true,
        },
      });
    }
  }
}
