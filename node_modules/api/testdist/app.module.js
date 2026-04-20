"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const schedule_1 = require("@nestjs/schedule");
const account_module_1 = require("./modules/account/account.module");
const user_module_1 = require("./modules/user/user.module");
const user_account_module_1 = require("./modules/user_account/user_account.module");
const auth_module_1 = require("./modules/auth/auth.module");
const event_module_1 = require("./modules/event/event.module");
const bank_module_1 = require("./modules/bank/bank.module");
const bank_account_module_1 = require("./modules/bank_account/bank_account.module");
const statement_type_module_1 = require("./modules/statement_type/statement_type.module");
const statement_organization_module_1 = require("./modules/statement_organization/statement_organization.module");
const statement_producer_module_1 = require("./modules/statement_producer/statement_producer.module");
const two_factor_module_1 = require("./modules/two_factor/two_factor.module");
const audit_module_1 = require("./modules/audit/audit.module");
const financial_chart_of_accounts_module_1 = require("./modules/financial_chart_of_accounts/financial_chart_of_accounts.module");
const core_1 = require("@nestjs/core");
const audit_interceptor_1 = require("./interceptors/audit.interceptor");
const financial_account_module_1 = require("./modules/financial_account/financial_account.module");
const financial_entry_module_1 = require("./modules/financial_entry/financial_entry.module");
const financial_posting_module_1 = require("./modules/financial_posting/financial_posting.module");
const financial_gateway_fee_rule_module_1 = require("./modules/financial_gateway_fee_rule/financial_gateway_fee_rule.module");
const role_module_1 = require("./modules/role/role.module");
const permission_module_1 = require("./modules/permission/permission.module");
const producer_payout_module_1 = require("./modules/producer_payout/producer_payout.module");
const sales_sync_module_1 = require("./modules/sales_sync/sales-sync.module");
const cockpit_ritual_module_1 = require("./modules/cockpit_ritual/cockpit_ritual.module");
const cockpit_meeting_module_1 = require("./modules/cockpit_meeting/cockpit_meeting.module");
const cockpit_action_plan_module_1 = require("./modules/cockpit_action_plan/cockpit_action_plan.module");
const cockpit_kpi_module_1 = require("./modules/cockpit_kpi/cockpit_kpi.module");
const cockpit_calendar_exception_module_1 = require("./modules/cockpit_calendar_exception/cockpit_calendar_exception.module");
const cockpit_notification_module_1 = require("./modules/cockpit_notification/cockpit_notification.module");
const cockpit_report_module_1 = require("./modules/cockpit_report/cockpit_report.module");
const postgres_connection_1 = require("./config/postgres-connection");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env', '.env.local'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    ...(0, postgres_connection_1.getPostgresConnectionOptions)((key) => configService.get(key)),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
                    migrationsRun: true,
                    synchronize: false,
                }),
                inject: [config_1.ConfigService],
            }),
            account_module_1.AccountModule,
            user_module_1.UserModule,
            user_account_module_1.UserAccountModule,
            event_module_1.EventModule,
            statement_organization_module_1.StatementOrganizationModule,
            statement_producer_module_1.StatementProducerModule,
            bank_module_1.BankModule,
            bank_account_module_1.BankAccountModule,
            statement_type_module_1.StatementTypeModule,
            auth_module_1.AuthModule,
            two_factor_module_1.TwoFactorModule,
            audit_module_1.AuditModule,
            financial_account_module_1.FinancialAccountModule,
            financial_chart_of_accounts_module_1.FinancialChartOfAccountsModule,
            financial_entry_module_1.FinancialEntryModule,
            financial_posting_module_1.FinancialPostingModule,
            financial_gateway_fee_rule_module_1.FinancialGatewayFeeRuleModule,
            producer_payout_module_1.ProducerPayoutModule,
            role_module_1.RoleModule,
            permission_module_1.PermissionModule,
            sales_sync_module_1.SalesSyncModule,
            cockpit_ritual_module_1.CockpitRitualModule,
            cockpit_meeting_module_1.CockpitMeetingModule,
            cockpit_action_plan_module_1.CockpitActionPlanModule,
            cockpit_kpi_module_1.CockpitKpiModule,
            cockpit_calendar_exception_module_1.CockpitCalendarExceptionModule,
            cockpit_notification_module_1.CockpitNotificationModule,
            cockpit_report_module_1.CockpitReportModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_interceptor_1.AuditInterceptor,
            },
        ],
    })
], AppModule);
