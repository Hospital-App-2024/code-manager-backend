import { Injectable } from '@nestjs/common';
import { CreateCodeBlueDto } from './dto/create-code-blue.dto';
import { UpdateCodeBlueDto } from './dto/update-code-blue.dto';

@Injectable()
export class CodeBlueService {
  create(createCodeBlueDto: CreateCodeBlueDto) {
    return 'This action adds a new codeBlue';
  }

  findAll() {
    return `This action returns all codeBlue`;
  }

  findOne(id: number) {
    return `This action returns a #${id} codeBlue`;
  }

  update(id: number, updateCodeBlueDto: UpdateCodeBlueDto) {
    return `This action updates a #${id} codeBlue`;
  }

  remove(id: number) {
    return `This action removes a #${id} codeBlue`;
  }
}
