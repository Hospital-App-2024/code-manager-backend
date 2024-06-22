import { Module } from '@nestjs/common';
import { CodeLeakService } from './code-leak.service';
import { CodeLeakController } from './code-leak.controller';

@Module({
  controllers: [CodeLeakController],
  providers: [CodeLeakService],
})
export class CodeLeakModule {}
