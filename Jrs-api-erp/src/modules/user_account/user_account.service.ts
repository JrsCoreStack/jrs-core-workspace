import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAccountEntity } from './entities/user_account.entity';
import { ILike, Repository } from 'typeorm';
import { CreateUserAccountDTO } from './dtos/create';
import { validate } from 'class-validator';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class UserAccountService {
  constructor(
    @InjectRepository(UserAccountEntity)
    private readonly userAccountRepository: Repository<UserAccountEntity>,
  ) {}

  async create(
    createUserAccountDTO: CreateUserAccountDTO,
  ): Promise<UserAccountEntity> {
    const dto = Object.assign(new CreateUserAccountDTO(), createUserAccountDTO);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const userAccount = this.userAccountRepository.create(createUserAccountDTO);
    return this.userAccountRepository.save(userAccount);
  }

  async findAll(
    account_id?: string,
    name?: string,
  ): Promise<UserAccountEntity[]> {
    return this.userAccountRepository.find({
      relations: ['user', 'account'],
      where: {
        account_id: account_id,
        user: {
          name: name ? ILike(`%${name}%`) : undefined,
        },
      },
    });
  }

  async findById(id: string): Promise<UserAccountEntity> {
    const userAccount = await this.userAccountRepository.findOne({
      where: { id },
      relations: ['user', 'account'],
    });
    if (!userAccount) {
      throw new BadRequestException(
        `Conta de usuário com ID ${id} não encontrada.`,
      );
    }
    return userAccount;
  }

  async findByUserId(userId: string): Promise<UserAccountEntity[]> {
    const user = await this.userAccountRepository.find({
      relations: ['user', 'account', 'role'],
      where: {
        user_id: userId,
      },
    });
    return user;
  }

  async findByCpf(cpf: string): Promise<UserAccountEntity | null> {
    cpf = cpf.replace(/\D/g, '');
    const users = await this.userAccountRepository.find({
      relations: [
        'user',
        'account',
        'role',
        'account.user_accounts',
        'account.user_accounts.user',
      ],
      where: {
        user: {
          cpf: cpf,
        },
      },
    });

    if (users.length > 0) {
      return users[0];
    }

    return null;
  }

  async findByEmail(email: string): Promise<UserAccountEntity | null> {
    const users = await this.userAccountRepository.find({
      relations: [
        'user',
        'account',
        'account.user_accounts',
        'account.user_accounts.user',
      ],
      where: {
        user: {
          email: email,
        },
      },
    });

    if (users.length > 0) {
      return users[0];
    }

    return null;
  }

  async update(
    id: string,
    updateUserAccountDTO: Partial<CreateUserAccountDTO>,
  ): Promise<UserAccountEntity> {
    const userAccount = await this.findById(id);
    const updatedUserAccount = Object.assign(userAccount, updateUserAccountDTO);
    return this.userAccountRepository.save(updatedUserAccount);
  }

  async delete(id: string): Promise<void> {
    const userAccount = await this.findById(id);
    await this.userAccountRepository.remove(userAccount);
  }
}
