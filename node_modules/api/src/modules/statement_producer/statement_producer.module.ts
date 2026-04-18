import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatementProducerController } from './statement_producer.controller';
import { StatementProducerEntity } from './entities/statement_producer.entity';
import { StatementProducerService } from './statement_producer.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([StatementProducerEntity]), AuthModule],
  controllers: [StatementProducerController],
  providers: [StatementProducerService],
  exports: [StatementProducerService],
})
export class StatementProducerModule {}
