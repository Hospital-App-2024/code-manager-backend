import { Module } from '@nestjs/common';
import { CodeRedService } from './code-red.service';
import { CodeRedController } from './code-red.controller';

@Module({
  controllers: [CodeRedController],
  providers: [CodeRedService],
})
export class CodeRedModule {}
