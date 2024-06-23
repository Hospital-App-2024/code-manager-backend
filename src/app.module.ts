import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CodeGreenModule } from './code-green/code-green.module';
import { OperatorModule } from './operator/operator.module';
import { CodeBlueModule } from './code-blue/code-blue.module';
import { PrinterModule } from './printer/printer.module';
import { CodeAirModule } from './code-air/code-air.module';
import { CodeRedModule } from './code-red/code-red.module';
import { CodeLeakModule } from './code-leak/code-leak.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [AuthModule, PrismaModule, CodeGreenModule, OperatorModule, CodeBlueModule, PrinterModule, CodeAirModule, CodeRedModule, CodeLeakModule, UserModule],
})
export class AppModule {}
