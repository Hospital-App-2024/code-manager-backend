import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CodeGreenModule } from './code-green/code-green.module';
import { OperatorModule } from './operator/operator.module';
import { CodeBlueModule } from './code-blue/code-blue.module';

@Module({
  imports: [AuthModule, PrismaModule, CodeGreenModule, OperatorModule, CodeBlueModule],
})
export class AppModule {}
