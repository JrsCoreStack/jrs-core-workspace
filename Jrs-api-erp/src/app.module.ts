import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AccountModule } from './modules/account/account.module';
import { UserModule } from './modules/user/user.module';
import { UserAccountModule } from './modules/user_account/user_account.module';
import { AuthModule } from './modules/auth/auth.module';
import { EventModule } from './modules/event/event.module';
import { BankModule } from './modules/bank/bank.module';
import { BankAccountModule } from './modules/bank_account/bank_account.module';
import { StatementTypeModule } from './modules/statement_type/statement_type.module';
import { StatementOrganizationModule } from './modules/statement_organization/statement_organization.module';
import { StatementProducerModule } from './modules/statement_producer/statement_producer.module';
import { TwoFactorModule } from './modules/two_factor/two_factor.module';
import { AuditModule } from './modules/audit/audit.module';
import { FinancialChartOfAccountsModule } from './modules/financial_chart_of_accounts/financial_chart_of_accounts.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { FinancialAccountModule } from './modules/financial_account/financial_account.module';
import { FinancialEntryModule } from './modules/financial_entry/financial_entry.module';
import { FinancialPostingModule } from './modules/financial_posting/financial_posting.module';
import { FinancialGatewayFeeRuleModule } from './modules/financial_gateway_fee_rule/financial_gateway_fee_rule.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { ProducerPayoutModule } from './modules/producer_payout/producer_payout.module';
import { SalesSyncModule } from './modules/sales_sync/sales-sync.module';
import { CockpitRitualModule } from './modules/cockpit_ritual/cockpit_ritual.module';
import { CockpitMeetingModule } from './modules/cockpit_meeting/cockpit_meeting.module';
import { CockpitActionPlanModule } from './modules/cockpit_action_plan/cockpit_action_plan.module';
import { CockpitKpiModule } from './modules/cockpit_kpi/cockpit_kpi.module';
import { CockpitCalendarExceptionModule } from './modules/cockpit_calendar_exception/cockpit_calendar_exception.module';
import { CockpitNotificationModule } from './modules/cockpit_notification/cockpit_notification.module';
import { CockpitReportModule } from './modules/cockpit_report/cockpit_report.module';
import { getPostgresConnectionOptions } from './config/postgres-connection';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        ...getPostgresConnectionOptions((key) => configService.get<string>(key)),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AccountModule,
    UserModule,
    UserAccountModule,
    EventModule,
    StatementOrganizationModule,
    StatementProducerModule,
    BankModule,
    BankAccountModule,
    StatementTypeModule,
    AuthModule,
    TwoFactorModule,
    AuditModule,
    FinancialAccountModule,
    FinancialChartOfAccountsModule,
    FinancialEntryModule,
    FinancialPostingModule,
    FinancialGatewayFeeRuleModule,
    ProducerPayoutModule,
    RoleModule,
    PermissionModule,
    SalesSyncModule,
    CockpitRitualModule,
    CockpitMeetingModule,
    CockpitActionPlanModule,
    CockpitKpiModule,
    CockpitCalendarExceptionModule,
    CockpitNotificationModule,
    CockpitReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule { }
