import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dtos/create';
import { validate } from 'class-validator';
import { hash } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createUserDTO: CreateUserDTO): Promise<UserEntity> {
    const dto = Object.assign(new CreateUserDTO(), createUserDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const salt = 10;
    const passwordHashed = await hash(createUserDTO.password, salt);
    const cpfDigits = createUserDTO.cpf.replace(/\D/g, '');
    const account = this.userRepository.create({
      ...createUserDTO,
      cpf: cpfDigits,
      password: passwordHashed,
    });
    return this.userRepository.save(account);
  }

  async saveTotpSecret(email: string, secret: string): Promise<void> {
    await this.userRepository.update(
      {
        email: email,
      },
      {
        totp_secret: secret,
        is2fa_enabled: true,
      },
    );
  }

  async findAll(search?: string): Promise<UserEntity[]> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.user_accounts', 'user_accounts');

    if (search) {
      const searchTerm = search.trim();
      
      // Remove caracteres não numéricos do CPF para busca
      const cpfSearch = searchTerm.replace(/\D/g, '');
      
      // Se o termo de busca contém números, busca também por CPF
      if (cpfSearch && cpfSearch.length > 0) {
        queryBuilder.where(
          '(user.name ILIKE :search OR user.email ILIKE :search OR user.cpf = :cpfSearch)',
          {
            search: `%${searchTerm}%`,
            cpfSearch: cpfSearch,
          },
        );
      } else {
        // Se não contém números, busca apenas por nome e email
        queryBuilder.where(
          '(user.name ILIKE :search OR user.email ILIKE :search)',
          {
            search: `%${searchTerm}%`,
          },
        );
      }
    }

    return queryBuilder.getMany();
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['user_accounts'],
    });
    if (!user) {
      throw new BadRequestException(`Usuário com ID ${id} não encontrado.`);
    }
    return user;
  }

  async findByCpf(cpf: string): Promise<UserEntity | null> {
    cpf = cpf.replace(/\D/g, '');
    const user = await this.userRepository.findOne({
      where: { cpf },
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user) {
      return user;
    } else {
      return null;
    }
  }

  async update(
    id: string,
    updateUserDTO: Partial<CreateUserDTO>,
  ): Promise<UserEntity> {
    const user = await this.findById(id);
    const updatedUser = Object.assign(user, updateUserDTO);
    return this.userRepository.save(updatedUser);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { last_login: new Date() },
    );
  }
}
