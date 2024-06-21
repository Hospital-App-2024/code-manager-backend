import { Injectable } from '@nestjs/common';
import { CreateCodeAirDto } from './dto/create-code-air.dto';
import { UpdateCodeAirDto } from './dto/update-code-air.dto';

@Injectable()
export class CodeAirService {
  create(createCodeAirDto: CreateCodeAirDto) {
    return 'This action adds a new codeAir';
  }

  findAll() {
    return `This action returns all codeAir`;
  }

  findOne(id: number) {
    return `This action returns a #${id} codeAir`;
  }

  update(id: number, updateCodeAirDto: UpdateCodeAirDto) {
    return `This action updates a #${id} codeAir`;
  }

  remove(id: number) {
    return `This action removes a #${id} codeAir`;
  }
}
