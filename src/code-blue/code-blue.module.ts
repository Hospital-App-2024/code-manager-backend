import { Module } from '@nestjs/common';
import { CodeBlueService } from './code-blue.service';
import { CodeBlueController } from './code-blue.controller';

@Module({
  controllers: [CodeBlueController],
  providers: [CodeBlueService],
})
export class CodeBlueModule {}
