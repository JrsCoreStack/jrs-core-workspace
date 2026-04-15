import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateEventDTO } from './dtos/create';
import { validate } from 'class-validator';
import { EventEntity } from './entities/event.entity';
import { AccountService } from '../account/account.service';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(EventEntity)
    private readonly eventRepository: Repository<EventEntity>,
    private readonly accountService: AccountService,
  ) {}

  async create(createEventDTO: CreateEventDTO): Promise<EventEntity> {
    await this.accountService.findById(createEventDTO.account_id);
    const dto = Object.assign(new CreateEventDTO(), {
      ...createEventDTO,
      start_date: new Date(createEventDTO.start_date),
      end_date: new Date(createEventDTO.end_date),
    });
    const errors = await validate(dto);
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => {
        return Object.values(error.constraints || {}).join(', ');
      });
      throw new BadRequestException(
        `Dados inválidos: ${errorMessages.join(', ')}`,
      );
    }
    const eventExists = await this.eventExists(
      createEventDTO.id_reference,
      createEventDTO.account_id,
    );
    if (eventExists) {
      throw new BadRequestException(
        `Evento com o id de referência ${createEventDTO.id_reference} já existe na conta ${createEventDTO.account_id}.`,
      );
    }
    const event = this.eventRepository.create(createEventDTO);
    return this.eventRepository.save(event);
  }

  async findAll(
    account_id?: string,
    limit?: number,
    offset?: number,
    event_name?: string,
  ): Promise<{
    data: EventEntity[];
    total: number;
  }> {
    let where: FindOptionsWhere<EventEntity> = {
      account_id: account_id,
    };

    if (event_name) {
      where.name = ILike(`%${event_name}%`);
    }

    const events = await this.eventRepository.find({
      where: where,
      relations: ['account'],
      take: limit,
      skip: offset,
      order: {
        created_at: 'DESC',
      },
    });

    const countEvents = await this.eventRepository.count({
      where: { account_id: account_id },
    });

    return {
      data: events,
      total: countEvents,
    };
  }

  async findById(id: string): Promise<EventEntity> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new BadRequestException(`Evento não encontrado.`);
    }
    return event;
  }

  async eventExists(
    id_reference: number,
    account_id: string,
  ): Promise<EventEntity | null> {
    const event = await this.eventRepository.findOne({
      where: { id_reference, account_id },
    });
    if (event) {
      return event;
    } else {
      return null;
    }
  }
}
