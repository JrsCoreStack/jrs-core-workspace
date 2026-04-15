import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StatementTypeEntity } from './entities/statement_type.entity';
import { StatementTypeController } from './statement_type.controller';
import { StatementTypeService } from './statement_type.service';

@Module({
  imports: [TypeOrmModule.forFeature([StatementTypeEntity]), AuthModule],
  controllers: [StatementTypeController],
  providers: [StatementTypeService],
  exports: [StatementTypeService],
})
export class StatementTypeModule {}
