import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcryptjs from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  public constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = await this.prisma.user.create({
        data: {
          ...userData,
          password: bcryptjs.hashSync(password),
        },
      });

      delete user.password;

      return {
        user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.logger.error(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating the user',
      );
    }
  }

  public async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.findByEmail(email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) throw new UnauthorizedException('User is not active');

    delete user.password;

    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  public async checkAuthStatus(user: User) {
    delete user.password;
    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  public async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  public async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
