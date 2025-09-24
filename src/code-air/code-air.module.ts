import { Module } from '@nestjs/common';
import { CodeAirService } from './code-air.service';
import { CodeAirController } from './code-air.controller';

@Module({
  controllers: [CodeAirController],
  providers: [CodeAirService],
})
export class CodeAirModule {}
