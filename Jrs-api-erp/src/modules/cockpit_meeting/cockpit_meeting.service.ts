import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'class-validator';
import { CockpitMeetingEntity } from './entities/cockpit_meeting.entity';
import { CreateCockpitMeetingDTO } from './dtos/create';

@Injectable()
export class CockpitMeetingService {
  constructor(
    @InjectRepository(CockpitMeetingEntity)
    private readonly repo: Repository<CockpitMeetingEntity>,
  ) {}

  async create(payload: CreateCockpitMeetingDTO): Promise<CockpitMeetingEntity> {
    const dto = Object.assign(new CreateCockpitMeetingDTO(), payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
      throw new BadRequestException(`Dados inválidos: ${msgs.join(', ')}`);
    }

    const meeting = this.repo.create({
      ritual_id: payload.ritual_id ?? null,
      occurred_at: payload.occurred_at ? new Date(payload.occurred_at) : undefined,
      duration_min: payload.duration_min ?? 60,
      state: payload.state ?? 'done',
      ata: null,
      agenda_items: Array.isArray((payload as any).agenda_items) ? (payload as any).agenda_items : [],
      meeting_participants: Array.isArray((payload as any).meeting_participants)
        ? (payload as any).meeting_participants
        : [],
      ata_template_id: (payload as any).ata_template_id ?? null,
    });
    return this.repo.save(meeting);
  }

  async findAll(params?: {
    ritualId?: string;
    area?: string;
    occurred_from?: string;
    occurred_to?: string;
    q?: string;
  }): Promise<CockpitMeetingEntity[]> {
    const qb = this.repo.createQueryBuilder('m');
    if (params?.ritualId) qb.andWhere('m.ritual_id = :rid', { rid: params.ritualId });
    if (params?.area && params.area !== 'ALL') {
      qb.andWhere(`m.ritual_id IN (SELECT id FROM erp_cockpit_ritual WHERE area = :area)`, {
        area: params.area,
      });
    }
    if (params?.occurred_from) {
      qb.andWhere('m.occurred_at >= :of', { of: new Date(params.occurred_from) });
    }
    if (params?.occurred_to) {
      qb.andWhere('m.occurred_at <= :ot', { ot: new Date(params.occurred_to) });
    }
    const qq = params?.q?.trim();
    if (qq) {
      qb.andWhere(
        `(COALESCE(m.ata::text,'') ILIKE :qq OR COALESCE(m.agenda_items::text,'') ILIKE :qq OR COALESCE(m.meeting_participants::text,'') ILIKE :qq)`,
        { qq: `%${qq}%` },
      );
    }
    qb.orderBy('m.occurred_at', 'DESC');
    return qb.getMany();
  }

  async findById(id: string): Promise<CockpitMeetingEntity> {
    const meeting = await this.repo.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Reunião não encontrada.');
    return meeting;
  }

  async attachAta(id: string, body: any): Promise<CockpitMeetingEntity> {
    const meeting = await this.findById(id);
    if (body?.agenda_items !== undefined) meeting.agenda_items = body.agenda_items;
    if (body?.meeting_participants !== undefined) meeting.meeting_participants = body.meeting_participants;
    if (body?.ata_template_id !== undefined) meeting.ata_template_id = body.ata_template_id;
    if (body?.ata !== undefined) {
      meeting.ata = body.ata;
    } else if (body !== undefined) {
      const { agenda_items: _a, meeting_participants: _p, ata_template_id: _t, ...rest } = body;
      if (Object.keys(rest).length) meeting.ata = rest;
    }
    meeting.state = 'done';
    return this.repo.save(meeting);
  }

  async diffMeetings(id: string, otherId: string): Promise<{
    left: CockpitMeetingEntity;
    right: CockpitMeetingEntity;
    ata_equal: boolean;
    agenda_equal: boolean;
    participants_equal: boolean;
  }> {
    const left = await this.findById(id);
    const right = await this.findById(otherId);
    const ata_equal = JSON.stringify(left.ata ?? null) === JSON.stringify(right.ata ?? null);
    const agenda_equal = JSON.stringify(left.agenda_items ?? []) === JSON.stringify(right.agenda_items ?? []);
    const participants_equal =
      JSON.stringify(left.meeting_participants ?? []) === JSON.stringify(right.meeting_participants ?? []);
    return { left, right, ata_equal, agenda_equal, participants_equal };
  }
}

