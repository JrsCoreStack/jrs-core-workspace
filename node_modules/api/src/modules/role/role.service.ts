import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { UserRole } from 'src/utils/enums/user_role.enum';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async findAll(includePermissions = false): Promise<RoleEntity[]> {
    const options: any = {
      order: {
        name: 'ASC',
      },
    };

    if (includePermissions) {
      options.relations = ['role_permissions', 'role_permissions.permission'];
    }

    return this.roleRepository.find(options);
  }

  async findById(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['role_permissions', 'role_permissions.permission'],
    });

    if (!role) {
      throw new Error(`Role com ID ${id} não encontrado.`);
    }

    return role;
  }

  async findByName(name: UserRole): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['role_permissions', 'role_permissions.permission'],
    });
  }
}
