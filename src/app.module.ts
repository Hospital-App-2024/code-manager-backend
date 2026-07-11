import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { OperatorModule } from './operator/operator.module';
import { PrinterModule } from './printer/printer.module';
import { EmergencyCodesModule } from './emergency-codes/emergency-codes.module';

@Module({
  imports: [AuthModule, PrismaModule, OperatorModule, PrinterModule, UserModule, EmergencyCodesModule],
})
export class AppModule {}
