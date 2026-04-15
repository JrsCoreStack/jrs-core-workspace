import { BankAccountEntity } from 'src/modules/bank_account/entities/bank_account.entity';
import { FinancialChartOfAccountsEntity } from 'src/modules/financial_chart_of_accounts/entities/financial_chart_of_accounts.entity';
import { EventEntity } from 'src/modules/event/entities/event.entity';
import { FinancialAccountEntity } from 'src/modules/financial_account/entities/financial_account.entity';
import { FinancialEntryEntity } from 'src/modules/financial_entry/entities/financial_entry.entity';
import { StatementOrganizationEntity } from 'src/modules/statement_organization/entities/statement_organization.entity';
import { UserAccountEntity } from 'src/modules/user_account/entities/user_account.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccountLevel } from 'src/utils/enums/account_level.enum';

@Entity('erp_account')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  code: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    name: 'type',
    type: 'int',
    nullable: false,
    unique: true,
  })
  type: number;

  @Column({
    name: 'level',
    type: 'enum',
    enum: AccountLevel,
    enumName: 'account_level_enum',
    nullable: false,
    default: AccountLevel.OPERATIONAL,
  })
  level: AccountLevel;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => UserAccountEntity, (user_account) => user_account.account, {
    onDelete: 'CASCADE',
  })
  user_accounts: UserAccountEntity[];

  @OneToMany(() => EventEntity, (event) => event.account, {
    onDelete: 'CASCADE',
  })
  events: EventEntity[];

  @OneToMany(
    () => StatementOrganizationEntity,
    (statement) => statement.event,
    {
      onDelete: 'CASCADE',
    },
  )
  statements: StatementOrganizationEntity[];

  @OneToMany(() => BankAccountEntity, (bank_account) => bank_account.account, {
    onDelete: 'CASCADE',
  })
  bank_accounts: BankAccountEntity[];

  @OneToMany(
    () => FinancialChartOfAccountsEntity,
    (chart_of_accounts) => chart_of_accounts.account,
    {
      onDelete: 'CASCADE',
    },
  )
  chart_of_accounts: FinancialChartOfAccountsEntity[];

  @OneToMany(
    () => FinancialAccountEntity,
    (financial_account) => financial_account.account,
    {
      onDelete: 'CASCADE',
    },
  )
  financial_accounts: FinancialAccountEntity[];

  @OneToMany(
    () => FinancialEntryEntity,
    (financial_entry) => financial_entry.account,
    {
      onDelete: 'CASCADE',
    },
  )
  financial_entries: FinancialEntryEntity[];
}
