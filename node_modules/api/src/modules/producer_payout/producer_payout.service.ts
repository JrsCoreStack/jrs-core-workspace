import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FinancialEntryEntity } from '../financial_entry/entities/financial_entry.entity';
import { FinancialEntryType } from 'src/utils/enums/financial_entry_type.enum';
import { FinancialChartOfAccountsService } from '../financial_chart_of_accounts/financial_chart_of_accounts.service';
import { AccountService } from '../account/account.service';
import { ExternalSource } from 'src/utils/enums/external_source.enum';
import { PaymentRequestDTO } from './dtos/payment-request.dto';
import { ManualPayoutEntity } from './entities/manual_payout.entity';
import { FinancialEntryService } from '../financial_entry/financial_entry.service';
import { CreateManualPayoutDTO } from './dtos/create-manual-payout.dto';
import { AccountLevel } from 'src/utils/enums/account_level.enum';
import { AccountEntity } from '../account/entities/account.entity';

@Injectable()
export class ProducerPayoutService {
  private readonly EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'https://f9611f378168.ngrok-free.app';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(FinancialEntryEntity)
    private readonly financialEntryRepository: Repository<FinancialEntryEntity>,
    @InjectRepository(ManualPayoutEntity)
    private readonly manualPayoutRepository: Repository<ManualPayoutEntity>,
    @InjectRepository(AccountEntity)
    private readonly accountRepository: Repository<AccountEntity>,
    private readonly dataSource: DataSource,
    private readonly financialChartOfAccountsService: FinancialChartOfAccountsService,
    private readonly accountService: AccountService,
    private readonly financialEntryService: FinancialEntryService,
  ) {}

  /**
   * Busca solicitações de pagamento aprovadas da API externa
   */
  async fetchPaymentRequests(filters: {
    account_code?: string;
    event_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaymentRequestDTO[]> {
    try {
      const params = new URLSearchParams();
      if (filters.limit) params.append('limit', String(filters.limit));
      if (filters.offset) params.append('offset', String(filters.offset));
      if (filters.status) params.append('status', filters.status);

      const response = await firstValueFrom(
        this.httpService.get(`${this.EXTERNAL_API_URL}/finances/requests?${params}`)
      );

      let requests: PaymentRequestDTO[] = response.data || [];

      // Filtrar por event_id se fornecido
      if (filters.event_id) {
        requests = requests.filter((req) => 
          req.event_id?.toString() === filters.event_id
        );
      }

      return requests;
    } catch (error: any) {
      throw new BadRequestException(
        `Erro ao buscar solicitações de pagamento: ${error.message}`
      );
    }
  }

  /**
   * Marca uma solicitação como paga
   * 1. Atualiza na API externa
   * 2. Cria lançamento contábil para descontar da obrigação
   */
  async markAsPaid(
    requestId: number,
    account_code: string,
    userId?: string,
  ): Promise<void> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      // 1. Buscar a solicitação na API externa
      const requests = await this.fetchPaymentRequests({});
      const request = requests.find((r) => r.id === requestId);

      if (!request) {
        throw new BadRequestException('Solicitação não encontrada');
      }

      if (request.payed) {
        throw new BadRequestException('Solicitação já foi marcada como paga');
      }

      // 2. Atualizar na API externa (marcar como pago)
      // Nota: Ajustar o endpoint conforme a API externa disponibilizar
      // Por enquanto, vamos apenas criar o lançamento contábil
      // O campo payed será atualizado manualmente ou via outro endpoint
      try {
        // Tentar atualizar se o endpoint existir
        await firstValueFrom(
          this.httpService.patch(
            `${this.EXTERNAL_API_URL}/finances/requests/${requestId}`,
            { payed: true }
          )
        );
      } catch (error: any) {
        // Se a API externa não tiver esse endpoint, apenas logar
        console.warn(`Aviso: Não foi possível atualizar na API externa: ${error.message}`);
        // Continuar mesmo assim para criar o lançamento contábil
      }

      // 3. Buscar conta e plano de contas
      const account = await this.accountService.findByCode(account_code);
      
      // Se for conta MASTER, buscar a conta contábil de qualquer conta (não filtrar por account_id)
      // Se não for MASTER, buscar normalmente pelo account_id
      let producerRepass;
      if (account.level === AccountLevel.MASTER) {
        // Para conta master, buscar pelo código sem filtrar por account_id
        try {
          producerRepass = await this.financialChartOfAccountsService.findByCode('2.1.1');
        } catch (error) {
          throw new BadRequestException(
            'Conta contábil Repasse a Produtor (2.1.1) não encontrada. Verifique se o plano de contas foi criado.',
          );
        }
      } else {
        // Para conta operacional, buscar pelo account_id
        const chartOfAccounts = await this.financialChartOfAccountsService.findByAccountId(account.id);

        producerRepass = chartOfAccounts.find((item) => item.code === '2.1.1');
        if (!producerRepass) {
          throw new BadRequestException(
            `Conta contábil Repasse a Produtor (2.1.1) não encontrada para a conta ${account.code}. Verifique se o plano de contas foi criado.`,
          );
        }
      }

      // 4. Criar lançamento contábil (LIABILITY DEBIT para reduzir a obrigação)
      const entry = this.financialEntryRepository.create({
        account_id: account.id,
        chart_of_account_id: producerRepass.id,
        type: FinancialEntryType.DEBIT, // DEBIT reduz a obrigação (LIABILITY)
        amount: request.value,
        description: `Repasse pago - ${request.payment_receiver} - Evento: ${request.event?.name || request.description}`,
        reference_id: String(request.id),
        reference_type: 'PRODUCER_PAYOUT',
        external_source: ExternalSource.ERP,
        entry_date: new Date(),
        event_id: request.event_id ? String(request.event_id) : null,
        event_name: request.event?.name || request.description || null,
      });

      await this.financialEntryRepository.save(entry);

      await runner.commitTransaction();
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }

  /**
   * Cria um saque manual para um evento
   * Valida que o valor não seja maior que o saldo pendente do evento
   */
  async createManualPayout(
    data: CreateManualPayoutDTO,
    userId?: string,
  ): Promise<ManualPayoutEntity> {
    const runner = this.dataSource.createQueryRunner();
    await runner.connect();
    await runner.startTransaction();

    try {
      // 1. Buscar conta
      const account = await this.accountService.findByCode(data.account_code);

      // 2. Buscar saldo do evento
      const eventBalances = await this.financialEntryService.getEventFinancialBalance(
        account.id,
      );

      const eventBalance = eventBalances.find(
        (eb) => eb.event_id === data.event_id,
      );

      if (!eventBalance) {
        throw new BadRequestException(
          `Evento ${data.event_id} não encontrado ou sem transações`,
        );
      }

      // 3. Validar que o valor não seja maior que o saldo pendente
      if (data.amount > eventBalance.pending_balance) {
        throw new BadRequestException(
          `O valor do saque (R$ ${data.amount.toFixed(2)}) não pode ser maior que o saldo pendente do evento (R$ ${eventBalance.pending_balance.toFixed(2)})`,
        );
      }

      // 3.5. Se for conta master, descobrir qual account_id tem esse evento
      let targetAccountId = account.id;
      if (account.level === AccountLevel.MASTER) {
        // Buscar uma entry existente desse evento para descobrir o account_id correto
        const existingEntry = await this.financialEntryRepository.findOne({
          where: { event_id: data.event_id },
          select: ['account_id'],
        });

        if (existingEntry) {
          targetAccountId = existingEntry.account_id;
        } else {
          // Se não houver entry existente, usar a primeira conta operacional
          const operationalAccounts = await this.accountRepository.find({
            where: { level: AccountLevel.OPERATIONAL },
          });
          if (operationalAccounts.length > 0) {
            targetAccountId = operationalAccounts[0].id;
          } else {
            throw new BadRequestException(
              'Nenhuma conta operacional encontrada. Não é possível criar o saque manual.',
            );
          }
        }
      }

      // 4. Buscar plano de contas
      // Se for conta MASTER, buscar a conta contábil de qualquer conta (não filtrar por account_id)
      // Se não for MASTER, buscar normalmente pelo account_id
      let producerRepass;
      if (account.level === AccountLevel.MASTER) {
        // Para conta master, buscar pelo código sem filtrar por account_id
        try {
          producerRepass = await this.financialChartOfAccountsService.findByCode('2.1.1');
        } catch (error) {
          throw new BadRequestException(
            'Conta contábil Repasse a Produtor (2.1.1) não encontrada. Verifique se o plano de contas foi criado.',
          );
        }
      } else {
        // Para conta operacional, buscar pelo account_id
        const chartOfAccounts = await this.financialChartOfAccountsService.findByAccountId(
          account.id,
        );

        producerRepass = chartOfAccounts.find((item) => item.code === '2.1.1');
        if (!producerRepass) {
          throw new BadRequestException(
            `Conta contábil Repasse a Produtor (2.1.1) não encontrada para a conta ${account.code}. Verifique se o plano de contas foi criado.`,
          );
        }
      }

      // 5. Criar lançamento contábil (LIABILITY DEBIT para reduzir a obrigação)
      const entry = this.financialEntryRepository.create({
        account_id: targetAccountId, // Usar o account_id correto (da conta operacional que tem o evento)
        chart_of_account_id: producerRepass.id,
        type: FinancialEntryType.DEBIT, // DEBIT reduz a obrigação (LIABILITY)
        amount: data.amount,
        description:
          data.description ||
          `Repasse manual - ${data.payment_receiver || 'Produtor'} - Evento: ${eventBalance.event_name || data.event_id}`,
        reference_id: null, // Saque manual não tem reference_id da API externa
        reference_type: 'MANUAL_PAYOUT',
        external_source: ExternalSource.ERP,
        entry_date: new Date(),
        event_id: data.event_id,
        event_name: eventBalance.event_name,
      });

      const savedEntry = await this.financialEntryRepository.save(entry);

      // 6. Criar registro de saque manual
      const manualPayout = this.manualPayoutRepository.create({
        account_id: targetAccountId, // Usar o account_id correto (da conta operacional que tem o evento)
        event_id: data.event_id,
        event_name: eventBalance.event_name,
        amount: data.amount,
        description: data.description,
        financial_entry_id: savedEntry.id,
        payment_receiver: data.payment_receiver,
        payment_key: data.payment_key,
      });

      const savedPayout = await this.manualPayoutRepository.save(manualPayout);

      await runner.commitTransaction();
      return savedPayout;
    } catch (error) {
      await runner.rollbackTransaction();
      throw error;
    } finally {
      await runner.release();
    }
  }
}
