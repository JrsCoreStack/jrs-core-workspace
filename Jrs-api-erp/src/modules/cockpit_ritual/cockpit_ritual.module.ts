import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CockpitRitualEntity } from './entities/cockpit_ritual.entity';
import { CockpitRitualController } from './cockpit_ritual.controller';
import { CockpitRitualService } from './cockpit_ritual.service';

@Module({
  imports: [TypeOrmModule.forFeature([CockpitRitualEntity])],
  controllers: [CockpitRitualController],
  providers: [CockpitRitualService],
  exports: [CockpitRitualService],
})
export class CockpitRitualModule {}

