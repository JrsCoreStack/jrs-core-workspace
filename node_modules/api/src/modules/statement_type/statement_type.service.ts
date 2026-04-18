import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStatementTypeDTO } from './dtos/create';
import { validate } from 'class-validator';
import { StatementTypeEntity } from './entities/statement_type.entity';

@Injectable()
export class StatementTypeService {
  constructor(
    @InjectRepository(StatementTypeEntity)
    private readonly statementTypeRepository: Repository<StatementTypeEntity>,
  ) {}

  async create(
    createStatementTypeDTO: CreateStatementTypeDTO,
  ): Promise<StatementTypeEntity> {
    const dto = Object.assign(
      new CreateStatementTypeDTO(),
      createStatementTypeDTO,
    );
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const statementType = this.statementTypeRepository.create(
      createStatementTypeDTO,
    );
    return this.statementTypeRepository.save(statementType);
  }

  async findAll(
    limit?: number,
    offset?: number,
  ): Promise<{
    data: StatementTypeEntity[];
    total: number;
  }> {
    const statementsType = await this.statementTypeRepository.find({
      take: limit,
      skip: offset,
      order: {
        created_at: 'DESC',
      },
    });

    const countStatementsType = await this.statementTypeRepository.count({});

    return {
      data: statementsType,
      total: countStatementsType,
    };
  }

  async findById(id: string): Promise<StatementTypeEntity> {
    const statementType = await this.statementTypeRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!statementType) {
      throw new BadRequestException('Tipo de extrato não encontrado');
    }

    return statementType;
  }
}
