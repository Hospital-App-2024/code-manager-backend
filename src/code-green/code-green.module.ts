import { Module } from '@nestjs/common';
import { CodeGreenService } from './code-green.service';
import { CodeGreenController } from './code-green.controller';
import { PrinterModule } from 'src/printer/printer.module';

@Module({
  controllers: [CodeGreenController],
  providers: [CodeGreenService],
  imports: [PrinterModule],
})
export class CodeGreenModule {}
