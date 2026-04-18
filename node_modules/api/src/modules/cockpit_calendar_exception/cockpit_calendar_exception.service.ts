import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CockpitCalendarExceptionEntity } from './entities/cockpit_calendar_exception.entity';
import { CreateCockpitCalendarExceptionDTO } from './dtos/create';

@Injectable()
export class CockpitCalendarExceptionService {
  constructor(
    @InjectRepository(CockpitCalendarExceptionEntity)
    private readonly repo: Repository<CockpitCalendarExceptionEntity>,
  ) {}

  async create(payload: CreateCockpitCalendarExceptionDTO): Promise<CockpitCalendarExceptionEntity> {
    const dto = Object.assign(new CreateCockpitCalendarExceptionDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }
    const entity = this.repo.create({
      ritual_id: payload.ritual_id ?? null,
      occurrence_date: payload.occurrence_date,
      exception_type: payload.exception_type,
      notes: payload.notes ?? null,
    });
    return this.repo.save(entity);
  }

  async findAll(params?: { from?: string; to?: string; ritual_id?: string }): Promise<CockpitCalendarExceptionEntity[]> {
    const qb = this.repo.createQueryBuilder('e');
    if (params?.ritual_id) qb.andWhere('e.ritual_id = :ritual_id', { ritual_id: params.ritual_id });
    if (params?.from) qb.andWhere('e.occurrence_date >= :from', { from: params.from });
    if (params?.to) qb.andWhere('e.occurrence_date <= :to', { to: params.to });
    qb.orderBy('e.occurrence_date', 'DESC');
    return qb.getMany();
  }

  async findById(id: string): Promise<CockpitCalendarExceptionEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Exceção não encontrada.');
    return entity;
  }

  async update(id: string, payload: CreateCockpitCalendarExceptionDTO): Promise<CockpitCalendarExceptionEntity> {
    const entity = await this.findById(id);
    const dto = Object.assign(new CreateCockpitCalendarExceptionDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }

    entity.ritual_id = payload.ritual_id ?? null;
    entity.occurrence_date = payload.occurrence_date;
    entity.exception_type = payload.exception_type;
    entity.notes = payload.notes ?? null;
    return this.repo.save(entity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    await this.repo.remove(entity);
  }
}

