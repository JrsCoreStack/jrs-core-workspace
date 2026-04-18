import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FinancialEntryEntity } from '../financial_entry/entities/financial_entry.entity';
import { FinancialEntryType } from 'src/utils/enums/financial_entry_type.enum';
import { FinancialChartOfAccountsService } from '../financial_chart_of_accounts/financial_chart_of_accounts.service';
import { AccountService } from '../account/account.service';
import { ExternalSource } from 'src/utils/enums/external_source.enum';
import { CreateTicketSaleDTO } from './dtos/create-ticket-sale.dto';
import { externalSourceFormat } from 'src/utils/formats/external_source';
import { FinancialGatewayFeeRuleService } from '../financial_gateway_fee_rule/financial_gateway_fee_rule.service';

interface FinancialEntryData {
    account_id: string;
    chart_of_account_id: string;
    type: FinancialEntryType;
    amount: number;
    description: string;
    reference_id: string | null;
    reference_type: string | null;
    external_source: string;
    entry_date: Date;
    payment_method?: string | null;
    event_name?: string | null;
    event_id?: string | null;
    installments?: number | null;
    card_brand?: string | null;
    payment_id?: string | null;
}

@Injectable()
export class FinancialPostingService {
    private readonly logger = new Logger(FinancialPostingService.name);

    constructor(
        @InjectRepository(FinancialEntryEntity)
        private readonly financialEntryRepository: Repository<FinancialEntryEntity>,
        private readonly dataSource: DataSource,
        private readonly financialChartOfAccountsService: FinancialChartOfAccountsService,
        private readonly accountService: AccountService,
        private readonly financialGatewayFeeRuleService: FinancialGatewayFeeRuleService,
    ) { }


    async createTicketOnlineSale(data: CreateTicketSaleDTO): Promise<CreateTicketSaleDTO> {
        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();


        try {
            // Busca a account pelo code
            const account = await this.accountService.findByCode(data.account_code);



            // Busca contas contábeis
            const chartOfAccounts = await this.financialChartOfAccountsService.findByAccountId(account.id);

            const revenueAsset = chartOfAccounts.find((item) => item.code === '1.1.2');
            if (!revenueAsset) {
                throw new BadRequestException(
                    'Conta contábil Gateway de Pagamento (1.1.2) não encontrada',
                );
            }

            const producerRepass = chartOfAccounts.find((item) => item.code === '2.1.1');
            if (!producerRepass) {
                throw new BadRequestException(
                    'Conta contábil Repasse a Produtor (2.1.1) não encontrada',
                );
            }

            const taxesClient = chartOfAccounts.find((item) => item.code === '3.1.1.1');
            if (!taxesClient) {
                throw new BadRequestException(
                    'Conta contábil Taxa Administrativa - Cliente Final (3.1.1.1) não encontrada',
                );
            }

            const taxesProducer = chartOfAccounts.find((item) => item.code === '3.1.1.2');
            if (!taxesProducer) {
                throw new BadRequestException(
                    'Conta contábil Taxa Administrativa - Produtor (3.1.1.2) não encontrada',
                );
            }

            const spreadClient = chartOfAccounts.find((item) => item.code === '3.1.1.3');
            if (!spreadClient) {
                throw new BadRequestException(
                    'Conta contábil Spread - Cliente Final (3.1.1.3) não encontrada',
                );
            }

            const taxesGateway = chartOfAccounts.find((item) => item.code === '4.1.1');
            if (!taxesGateway) {
                throw new BadRequestException(
                    'Conta contábil Taxa de Gateway (4.1.1) não encontrada',
                );
            }

            // Calcular taxa de gateway dinamicamente
            let bank_fee = 0;
            try {
                const gateway = 'PICPAY'; // TODO: Tornar configurável ou buscar do banco
                const paymentMethod = data.payment_method 
                    ? String(data.payment_method).toUpperCase() 
                    : null;
                
                if (paymentMethod) {
                    const isPix = paymentMethod === 'PIX' || paymentMethod === 'PIXPS';
                    const cardBrand = isPix ? null : 'MasterCard';
                    const installments = isPix ? null : (data.installments || 1);

                    const feeResult = await this.financialGatewayFeeRuleService.findFeeByCriteria(
                        data.account_code,
                        gateway,
                        paymentMethod,
                        cardBrand,
                        installments,
                    );


                    if (feeResult) {
                        // Calcular: ((total_paid_amount + spread_customer_fee_amount) * percentage_fee / 100) + fixed_fee
                        const baseAmount = data.total_paid_amount + (data.spread_customer_fee_amount || 0);
                        bank_fee = (baseAmount * (feeResult.percentage_fee / 100)) + (feeResult.fixed_fee || 0);
                        
                        this.logger.debug(
                            `💰 Taxa de gateway calculada: ${bank_fee.toFixed(2)} (${feeResult.percentage_fee}% + ${feeResult.fixed_fee} fixo)`,
                        );
                    } else {
                        this.logger.warn(
                            `⚠️  Regra de taxa não encontrada para gateway=${gateway}, payment_method=${paymentMethod}, card_brand=${cardBrand}, installments=${installments}`,
                        );
                    }
                }
            } catch (error) {
                this.logger.error(
                    `❌ Erro ao buscar taxas do gateway: ${error.message}`,
                    error.stack,
                );
                // Continua com bank_fee = 0 se houver erro
            }

            const entryDate = new Date();
            const entries: FinancialEntryData[] = [
                // 1️⃣ Entrada do dinheiro (ATIVO)
                {
                    account_id: account.id,
                    chart_of_account_id: revenueAsset.id,
                    type: FinancialEntryType.DEBIT,
                    amount: data.total_paid_amount,
                    description: 'Entrada pagamento ingresso online',
                    reference_id: data.reference_id,
                    reference_type: 'TICKET_ONLINE_SALE',
                    external_source: externalSourceFormat(data.external_source) ?? ExternalSource.ERP,
                    entry_date: new Date(data.sale_created_at),
                    payment_method: data.payment_method || null,
                    event_name: data.event_name || null,
                    event_id: data.event_id || null,
                    installments: data.installments || null,
                    card_brand: data.card_brand || null,
                    payment_id: data.payment_id || null,
                },
                // 2️⃣ Obrigação com produtor (PASSIVO)
                {
                    account_id: account.id,
                    chart_of_account_id: producerRepass.id,
                    type: FinancialEntryType.CREDIT,
                    amount: data.ticket_amount,
                    description: 'Valor a repassar ao produtor',
                    reference_type: 'TICKET_ONLINE_SALE',
                    reference_id: data.reference_id,
                    external_source: externalSourceFormat(data.external_source) ?? ExternalSource.ERP,
                    entry_date: new Date(data.sale_created_at),
                    payment_method: data.payment_method || null,
                    event_name: data.event_name || null,
                    event_id: data.event_id || null,
                    installments: data.installments || null,
                    card_brand: data.card_brand || null,
                    payment_id: data.payment_id || null,
                },

                // 3️⃣ Receita - Taxa cliente
                {
                    account_id: account.id,
                    chart_of_account_id: taxesClient.id,
                    type: FinancialEntryType.CREDIT,
                    amount: data.customer_fee_amount,
                    description: 'Taxa administrativa - cliente final',
                    reference_type: 'TICKET_ONLINE_SALE',
                    reference_id: data.reference_id,
                    external_source: externalSourceFormat(data.external_source) ?? ExternalSource.ERP,
                    entry_date: new Date(data.sale_created_at),
                    payment_method: data.payment_method || null,
                    event_name: data.event_name || null,
                    event_id: data.event_id || null,
                    installments: data.installments || null,
                    card_brand: data.card_brand || null,
                    payment_id: data.payment_id || null,
                },

                // 4️⃣ Receita - Taxa produtor
                {
                    account_id: account.id,
                    chart_of_account_id: taxesProducer.id,
                    type: FinancialEntryType.CREDIT,
                    amount: data.producer_fee_amount,
                    description: 'Taxa administrativa - produtor',
                    reference_type: 'TICKET_ONLINE_SALE',
                    reference_id: data.reference_id,
                    external_source: externalSourceFormat(data.external_source) ?? ExternalSource.ERP,
                    entry_date: new Date(data.sale_created_at),
                    payment_method: data.payment_method || null,
                    event_name: data.event_name || null,
                    event_id: data.event_id || null,
                    installments: data.installments || null,
                    card_brand: data.card_brand || null,
                    payment_id: data.payment_id || null,
                },

                // 5️⃣ Receita - Spread - Cliente Final

                {
                    account_id: account.id,
                    chart_of_account_id: spreadClient.id,
                    type: FinancialEntryType.CREDIT,
                    amount: data.spread_customer_fee_amount,
                    description: 'Spread - cliente final',
                    reference_type: 'TICKET_ONLINE_SALE',
                    reference_id: data.reference_id,
                    external_source: externalSourceFormat(data.external_source) ?? ExternalSource.ERP,
                    entry_date: new Date(data.sale_created_at),
                    payment_method: data.payment_method || null,
                    event_name: data.event_name || null,
                    event_id: data.event_id || null,
                    installments: data.installments || null,
                    card_brand: data.card_brand || null,
                    payment_id: data.payment_id || null,
                },

                // 6️⃣ Despesa - Taxa de Gateway
                {
                    account_id: account.id,
                    chart_of_account_id: taxesGateway.id,
                    type: FinancialEntryType.DEBIT,
                    amount: bank_fee,
                    description: 'Taxa de gateway',
                    reference_type: 'TICKET_ONLINE_SALE',
                    reference_id: data.reference_id,
                    external_source: externalSourceFormat(data.external_source) ?? ExternalSource.ERP,
                    entry_date: new Date(data.sale_created_at),
                    payment_method: data.payment_method || null,
                    event_name: data.event_name || null,
                    event_id: data.event_id || null,
                    installments: data.installments || null,
                    card_brand: data.card_brand || null,
                    payment_id: data.payment_id || null,
                },
            ];

            // Filtrar entries com valor zero (não criar lançamentos com valor 0)
            const entriesToSave = entries.filter((entry) => {
                const amount = Number(entry.amount);
                return amount !== 0 && !isNaN(amount) && Math.abs(amount) > 0.01;
            });

            // Log se todos os entries foram filtrados (valores zerados)

            // Validar partida dobrada apenas com entries que serão salvos
            // const totalCredit = entriesToSave
            //     .filter(e => e.type === FinancialEntryType.CREDIT)
            //     .reduce((sum, e) => sum + Number(e.amount), 0);

            // const totalDebit = entriesToSave
            //     .filter(e => e.type === FinancialEntryType.DEBIT)
            //     .reduce((sum, e) => sum + Number(e.amount), 0);

            // if (Math.abs(totalCredit - totalDebit) > 0.01) {
            //     throw new BadRequestException(
            //         `Partida dobrada inválida: Crédito (${totalCredit}) ≠ Débito (${totalDebit})`,
            //     );
            // }

            // Cria os lançamentos dentro da transação (apenas os com valor > 0)
            entriesToSave.length > 0
                ? await Promise.all(
                    entriesToSave.map((entry) => {
                        const entity = this.financialEntryRepository.create(entry);
                        return runner.manager.save(FinancialEntryEntity, entity);
                    }),
                )
                : [];

        //    await Promise.all(
        //         entries.map((entry) => {
        //             const entity = this.financialEntryRepository.create(entry);
        //             return runner.manager.save(FinancialEntryEntity, entity);
        //         }),
        //     );

            await runner.commitTransaction();

            return {
                customer_fee_amount: data.customer_fee_amount,
                producer_fee_amount: data.producer_fee_amount,
                ticket_amount: data.ticket_amount,
                total_paid_amount: data.total_paid_amount,
                account_code: data.account_code,
                external_source: data.external_source,
                reference_id: data.reference_id,
                gateway_fee_amount: bank_fee,
                spread_customer_fee_amount: data.spread_customer_fee_amount,
                sale_created_at: data.sale_created_at,
            };
        } catch (error) {
            await runner.rollbackTransaction();
            throw error;
        } finally {
            await runner.release();
        }
    }

  
    async createPosting(entries: FinancialEntryData[]): Promise<FinancialEntryEntity[]> {
        if (!entries || entries.length === 0) {
            throw new BadRequestException('É necessário pelo menos um lançamento');
        }

        // Filtrar entries com valor zero (não criar lançamentos com valor 0)
        const entriesToSave = entries.filter((entry) => {
            const amount = Number(entry.amount);
            return amount !== 0 && !isNaN(amount) && Math.abs(amount) > 0.01;
        });

        if (entriesToSave.length === 0) {
            throw new BadRequestException('Não há lançamentos válidos para salvar (todos os valores são zero)');
        }

        // Validação de partida dobrada apenas com entries que serão salvos
        const totalCredit = entriesToSave
            .filter((e) => e.type === FinancialEntryType.CREDIT)
            .reduce((sum, e) => sum + Number(e.amount), 0);
        const totalDebit = entriesToSave
            .filter((e) => e.type === FinancialEntryType.DEBIT)
            .reduce((sum, e) => sum + Number(e.amount), 0);

        if (Math.abs(totalCredit - totalDebit) > 0.01) {
            throw new BadRequestException(
                `Partida dobrada inválida: Crédito (${totalCredit}) ≠ Débito (${totalDebit})`,
            );
        }

        // Validação de duplicação (se houver reference_id)
        const entriesWithReference = entriesToSave.filter(
            (e) => e.reference_id !== null && e.reference_type !== null,
        );
        if (entriesWithReference.length > 0) {
            const firstEntry = entriesWithReference[0];
            if (firstEntry.reference_id && firstEntry.reference_type) {
                const existing = await this.financialEntryRepository.findOne({
                    where: {
                        reference_id: firstEntry.reference_id,
                        reference_type: firstEntry.reference_type,
                        account_id: firstEntry.account_id,
                    },
                });

                if (existing) {
                    throw new BadRequestException(
                        `Lançamento contábil já existe para esta referência: ${firstEntry.reference_type}:${firstEntry.reference_id}`,
                    );
                }
            }
        }

        const runner = this.dataSource.createQueryRunner();
        await runner.connect();
        await runner.startTransaction();

        try {
            const createdEntries = await Promise.all(
                entriesToSave.map((entry) => {
                    const entity = this.financialEntryRepository.create(entry);
                    return runner.manager.save(FinancialEntryEntity, entity);
                }),
            );

            await runner.commitTransaction();
            return createdEntries;
        } catch (error) {
            await runner.rollbackTransaction();
            throw error;
        } finally {
            await runner.release();
        }
    }
}
