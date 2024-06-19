import { Module } from '@nestjs/common';
import { CodeGreenService } from './code-green.service';
import { CodeGreenController } from './code-green.controller';

@Module({
  controllers: [CodeGreenController],
  providers: [CodeGreenService],
})
export class CodeGreenModule {}
