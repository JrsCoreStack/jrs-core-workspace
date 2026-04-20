"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancialEntryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const financial_entry_entity_1 = require("./entities/financial_entry.entity");
const financial_entry_type_enum_1 = require("src/utils/enums/financial_entry_type.enum");
const account_entity_1 = require("../account/entities/account.entity");
const account_level_enum_1 = require("src/utils/enums/account_level.enum");
/**
 * FinancialEntryService - Apenas para leitura
 *
 * ⚠️ IMPORTANTE: Este service é APENAS para consulta.
 * Para criar lançamentos contábeis, use FinancialPostingService.
 *
 * O FinancialPostingService é o único ponto de entrada para criação
 * de lançamentos, garantindo:
 * - Partida dobrada (débito = crédito)
 * - Prevenção de duplicados
 * - Consistência contábil
 */
let FinancialEntryService = class FinancialEntryService {
    financialEntryRepository;
    accountRepository;
    constructor(financialEntryRepository, accountRepository) {
        this.financialEntryRepository = financialEntryRepository;
        this.accountRepository = accountRepository;
    }
    async findFinancialStats(account_id, startDate, endDate) {
        // Verificar se a conta é MASTER
        const account = await this.accountRepository.findOne({
            where: { id: account_id },
        });
        if (!account) {
            throw new common_1.BadRequestException(`Conta não encontrada.`);
        }
        // Se for MASTER, buscar todas as contas OPERATIONAL
        let accountIds;
        if (account.level === account_level_enum_1.AccountLevel.MASTER) {
            const operationalAccounts = await this.accountRepository.find({
                where: { level: account_level_enum_1.AccountLevel.OPERATIONAL },
            });
            accountIds = operationalAccounts.map((acc) => acc.id);
        }
        else {
            accountIds = [account_id];
        }
        if (accountIds.length === 0) {
            return {
                revenue: 0,
                cost: 0,
                profit: 0,
            };
        }
        // Usar QueryBuilder com agregação direta (sintaxe correta)
        const queryBuilder = this.financialEntryRepository
            .createQueryBuilder('entry')
            .leftJoin('entry.chart_of_account', 'chart')
            .select(`SUM(CASE WHEN chart.type = 'INCOME' AND entry.type = 'CREDIT' THEN entry.amount ELSE 0 END)`, 'revenue')
            .addSelect(`SUM(CASE WHEN chart.type = 'EXPENSE' AND entry.type = 'DEBIT' THEN entry.amount ELSE 0 END)`, 'cost')
            .where('entry.account_id IN (:...accountIds)', { accountIds });
        if (startDate && endDate) {
            queryBuilder.andWhere('entry.entry_date BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        const result = await queryBuilder.getRawOne();
        const revenue = Number(result?.revenue || 0);
        const cost = Number(result?.cost || 0);
        const profit = revenue - cost;
        return {
            revenue: Number(revenue.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
        };
    }
    async findAll() {
        return this.financialEntryRepository.find();
    }
    async findById(id) {
        const financialEntry = await this.financialEntryRepository.findOne({
            where: { id },
        });
        if (!financialEntry) {
            throw new common_1.BadRequestException(`Lançamento não encontrado.`);
        }
        return financialEntry;
    }
    async findByAccountId(account_id) {
        return this.financialEntryRepository.find({
            where: { account_id },
        });
    }
    /**
     * Calcula o total líquido de um grupo de transações
     * Considera movimentações reais de dinheiro (ASSET, LIABILITY, EXPENSE)
     * e receitas (INCOME) como a taxa administrativa do produtor
     */
    calculateGroupTotal(entries) {
        return entries.reduce((sum, entry) => {
            const accountType = entry.chart_of_account?.type;
            const entryType = entry.type;
            const amount = Number(entry.amount);
            // ASSET (Ativo) - dinheiro/caixa - MOVIMENTAÇÃO REAL
            if (accountType === 'ASSET') {
                if (entryType === financial_entry_type_enum_1.FinancialEntryType.DEBIT) {
                    return sum + amount; // Entrada de dinheiro (positivo)
                }
                else {
                    return sum - amount; // Saída de dinheiro (negativo)
                }
            }
            // LIABILITY (Passivo) - obrigações - MOVIMENTAÇÃO REAL (dinheiro que você deve)
            if (accountType === 'LIABILITY') {
                if (entryType === financial_entry_type_enum_1.FinancialEntryType.CREDIT) {
                    return sum - amount; // Obrigação (negativo, dinheiro que você deve)
                }
                else {
                    return sum + amount; // Pagamento de obrigação (positivo)
                }
            }
            // EXPENSE (Despesa) - conta como saída real de dinheiro
            if (accountType === 'EXPENSE') {
                if (entryType === financial_entry_type_enum_1.FinancialEntryType.DEBIT) {
                    return sum - amount; // Despesa (negativo)
                }
                else {
                    return sum + amount; // Estorno de despesa (positivo)
                }
            }
            // INCOME (Receita) - conta como receita adicional (ex: taxa administrativa do produtor)
            if (accountType === 'INCOME') {
                if (entryType === financial_entry_type_enum_1.FinancialEntryType.CREDIT) {
                    return sum + amount; // Receita (positivo)
                }
                else {
                    return sum - amount; // Estorno de receita (negativo)
                }
            }
            // Se não for nenhum dos tipos conhecidos, não altera o saldo
            return sum;
        }, 0);
    }
    /**
     * Calcula o consolidado financeiro baseado nas entries
     */
    calculateConsolidated(entries) {
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalLiabilities = 0;
        entries.forEach((entry) => {
            const accountType = entry.chart_of_account?.type;
            const entryType = entry.type;
            const amount = Number(entry.amount);
            // Receita: ASSET com DEBIT (entrada de dinheiro)
            if (accountType === 'ASSET' && entryType === financial_entry_type_enum_1.FinancialEntryType.DEBIT) {
                totalRevenue += amount;
            }
            // Despesas: EXPENSE com DEBIT
            if (accountType === 'EXPENSE' && entryType === financial_entry_type_enum_1.FinancialEntryType.DEBIT) {
                totalExpenses += amount;
            }
            // Obrigações: LIABILITY com CREDIT (dinheiro que você deve pagar)
            if (accountType === 'LIABILITY' && entryType === financial_entry_type_enum_1.FinancialEntryType.CREDIT) {
                totalLiabilities += amount;
            }
        });
        const profit = totalRevenue - totalExpenses - totalLiabilities;
        return {
            total_revenue: Number(totalRevenue.toFixed(2)),
            total_expenses: Number(totalExpenses.toFixed(2)),
            total_liabilities: Number(totalLiabilities.toFixed(2)),
            profit: Number(profit.toFixed(2)),
        };
    }
    /**
     * Lista transações financeiras com paginação e filtros avançados
     * Suporta agrupamento por reference_id quando group_by_reference=true
     */
    async findAllPaginated(query) {
        const { page = 1, limit = 20, offset, account_id, chart_of_account_id, type, reference_type, reference_id, external_source, start_date, end_date, description, event_id, event_name, payment_id, order_by = 'entry_date', order_direction = 'DESC', group_by_reference = false, } = query;
        // Calcular offset baseado na página ou usar offset direto
        const calculatedOffset = offset !== undefined ? offset : (page - 1) * limit;
        // Verificar se a conta é MASTER (pode ver todas as contas)
        let isMasterAccount = false;
        if (account_id) {
            const account = await this.accountRepository.findOne({
                where: { id: account_id },
                select: ['id', 'level'],
            });
            isMasterAccount = account?.level === account_level_enum_1.AccountLevel.MASTER;
        }
        // Criar query builder
        const queryBuilder = this.financialEntryRepository
            .createQueryBuilder('entry')
            .leftJoinAndSelect('entry.account', 'account')
            .leftJoinAndSelect('entry.chart_of_account', 'chart_of_account');
        // Aplicar filtros
        // Se for conta MASTER, não aplicar filtro por account_id (vê todas as contas)
        if (account_id && !isMasterAccount) {
            queryBuilder.andWhere('entry.account_id = :account_id', { account_id });
        }
        if (chart_of_account_id) {
            queryBuilder.andWhere('entry.chart_of_account_id = :chart_of_account_id', {
                chart_of_account_id,
            });
        }
        if (type) {
            queryBuilder.andWhere('entry.type = :type', { type });
        }
        if (reference_type) {
            queryBuilder.andWhere('entry.reference_type = :reference_type', {
                reference_type,
            });
        }
        if (reference_id) {
            // Busca exata no reference_id (case-insensitive)
            queryBuilder.andWhere('entry.reference_id = :reference_id', {
                reference_id: reference_id,
            });
        }
        if (external_source) {
            queryBuilder.andWhere('entry.external_source = :external_source', {
                external_source,
            });
        }
        // Processar filtros de data
        if (start_date || end_date) {
            if (start_date && end_date) {
                // Converter strings para Date
                // Se a data já vem com hora (formato ISO com 'T'), usar diretamente
                // Se vier só a data (YYYY-MM-DD), ajustar para início/fim do dia
                const startDateStr = start_date.toString();
                const endDateStr = end_date.toString();
                let startDate;
                let endDate;
                // Verificar se tem hora na string (formato ISO ou com espaço)
                const hasTimeInStart = startDateStr.includes('T') || startDateStr.includes(' ');
                const hasTimeInEnd = endDateStr.includes('T') || endDateStr.includes(' ');
                if (hasTimeInStart) {
                    // Usar a data exatamente como veio (já tem hora)
                    startDate = new Date(start_date);
                }
                else {
                    // Só tem data, ajustar para início do dia
                    startDate = new Date(start_date);
                    startDate.setUTCHours(0, 0, 0, 0);
                }
                if (hasTimeInEnd) {
                    // Usar a data exatamente como veio (já tem hora)
                    endDate = new Date(end_date);
                }
                else {
                    // Só tem data, ajustar para final do dia
                    endDate = new Date(end_date);
                    endDate.setUTCHours(23, 59, 59, 999);
                }
                // Validar se as datas são válidas
                if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    throw new common_1.BadRequestException('Datas inválidas fornecidas');
                }
                queryBuilder.andWhere('entry.entry_date BETWEEN :start_date AND :end_date', {
                    start_date: startDate,
                    end_date: endDate,
                });
            }
            else if (start_date) {
                const startDateStr = start_date.toString();
                const hasTime = startDateStr.includes('T') || startDateStr.includes(' ');
                let startDate;
                if (hasTime) {
                    startDate = new Date(start_date);
                }
                else {
                    startDate = new Date(start_date);
                    startDate.setUTCHours(0, 0, 0, 0);
                }
                if (isNaN(startDate.getTime())) {
                    throw new common_1.BadRequestException('Data inicial inválida');
                }
                queryBuilder.andWhere('entry.entry_date >= :start_date', { start_date: startDate });
            }
            else if (end_date) {
                const endDateStr = end_date.toString();
                const hasTime = endDateStr.includes('T') || endDateStr.includes(' ');
                let endDate;
                if (hasTime) {
                    endDate = new Date(end_date);
                }
                else {
                    endDate = new Date(end_date);
                    endDate.setUTCHours(23, 59, 59, 999);
                }
                if (isNaN(endDate.getTime())) {
                    throw new common_1.BadRequestException('Data final inválida');
                }
                queryBuilder.andWhere('entry.entry_date <= :end_date', { end_date: endDate });
            }
        }
        if (description) {
            queryBuilder.andWhere('entry.description ILIKE :description', {
                description: `%${description}%`,
            });
        }
        if (event_id) {
            queryBuilder.andWhere('entry.event_id = :event_id', { event_id });
        }
        if (event_name) {
            queryBuilder.andWhere('entry.event_name ILIKE :event_name', {
                event_name: `%${event_name}%`,
            });
        }
        if (payment_id) {
            queryBuilder.andWhere('entry.payment_id = :payment_id', {
                payment_id,
            });
        }
        // Se group_by_reference=true, buscar todas as transações primeiro (sem paginação)
        if (group_by_reference) {
            // Buscar todas as transações que atendem aos filtros (sem paginação)
            const allTransactions = await queryBuilder
                .orderBy('entry.entry_date', 'ASC') // Ordenação temporária para garantir consistência
                .getMany();
            // Calcular consolidado com todas as transações
            const consolidated = this.calculateConsolidated(allTransactions);
            // Se não encontrou transações, retornar vazio
            if (allTransactions.length === 0) {
                return {
                    data: [],
                    total: 0,
                    page: 1,
                    limit: limit,
                    totalPages: 0,
                    consolidated,
                };
            }
            // Agrupar por reference_id
            const groupsMap = new Map();
            allTransactions.forEach((entry) => {
                const key = entry.reference_id || 'sem-referencia';
                if (!groupsMap.has(key)) {
                    groupsMap.set(key, []);
                }
                groupsMap.get(key).push(entry);
            });
            // Se reference_id foi fornecido e encontrou transações, retornar apenas aquele grupo
            if (reference_id) {
                if (groupsMap.has(reference_id)) {
                    const groupEntries = groupsMap.get(reference_id);
                    const total = this.calculateGroupTotal(groupEntries);
                    const sortedEntries = groupEntries.sort((a, b) => {
                        return new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime();
                    });
                    return {
                        data: [{
                                reference_id: reference_id,
                                total: Number(total.toFixed(2)),
                                transaction_count: groupEntries.length,
                                date: sortedEntries[0].entry_date.toISOString(),
                                transactions: sortedEntries,
                            }],
                        total: 1,
                        page: 1,
                        limit: 1,
                        totalPages: 1,
                        consolidated,
                    };
                }
                else {
                    // reference_id fornecido mas não encontrou transações
                    return {
                        data: [],
                        total: 0,
                        page: 1,
                        limit: limit,
                        totalPages: 0,
                        consolidated,
                    };
                }
            }
            // Calcular totais e estruturar grupos
            const groupedData = Array.from(groupsMap.entries()).map(([refId, entries]) => {
                // Calcular total líquido considerando apenas movimentações reais de dinheiro
                const total = this.calculateGroupTotal(entries);
                // Ordenar transações dentro do grupo por entry_date (crescente)
                const sortedEntries = entries.sort((a, b) => {
                    return new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime();
                });
                // Data do grupo = entry_date da primeira transação
                const groupDate = sortedEntries[0].entry_date;
                return {
                    reference_id: refId === 'sem-referencia' ? null : refId,
                    total: Number(total.toFixed(2)),
                    transaction_count: entries.length,
                    date: groupDate.toISOString(),
                    transactions: sortedEntries,
                };
            });
            // Ordenar grupos
            const validOrderBy = ['entry_date', 'created_at', 'amount'].includes(order_by)
                ? order_by
                : 'entry_date';
            const validOrderDirection = ['ASC', 'DESC'].includes(order_direction)
                ? order_direction
                : 'DESC';
            groupedData.sort((a, b) => {
                let comparison = 0;
                if (validOrderBy === 'amount') {
                    comparison = a.total - b.total;
                }
                else if (validOrderBy === 'entry_date') {
                    comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
                }
                else if (validOrderBy === 'created_at') {
                    // Pegar a created_at mais antiga de cada grupo
                    const aOldest = Math.min(...a.transactions.map(t => new Date(t.created_at).getTime()));
                    const bOldest = Math.min(...b.transactions.map(t => new Date(t.created_at).getTime()));
                    comparison = aOldest - bOldest;
                }
                return validOrderDirection === 'ASC' ? comparison : -comparison;
            });
            // Aplicar paginação nos grupos
            const totalGroups = groupedData.length;
            const calculatedOffset = offset !== undefined ? offset : (page - 1) * limit;
            const paginatedGroups = groupedData.slice(calculatedOffset, calculatedOffset + limit);
            const totalPages = Math.ceil(totalGroups / limit);
            return {
                data: paginatedGroups,
                total: totalGroups,
                page,
                limit,
                totalPages,
                consolidated,
            };
        }
        // Comportamento normal (sem agrupamento)
        // Buscar todas as transações para calcular consolidado (antes da paginação)
        const allTransactionsForConsolidated = await queryBuilder
            .orderBy('entry.entry_date', 'ASC')
            .getMany();
        const consolidated = this.calculateConsolidated(allTransactionsForConsolidated);
        // Ordenação
        const validOrderBy = ['entry_date', 'created_at', 'amount'].includes(order_by)
            ? order_by
            : 'entry_date';
        const validOrderDirection = ['ASC', 'DESC'].includes(order_direction)
            ? order_direction
            : 'DESC';
        queryBuilder.orderBy(`entry.${validOrderBy}`, validOrderDirection);
        // Paginação
        queryBuilder.skip(calculatedOffset).take(limit);
        // Executar queries
        const [data, total] = await queryBuilder.getManyAndCount();
        // Calcular total de páginas
        const totalPages = Math.ceil(total / limit);
        return {
            data,
            total,
            page,
            limit,
            totalPages,
            consolidated,
        };
    }
    /**
     * Calcula o saldo detalhado por evento para o financeiro/contabilidade
     * Mostra receitas, despesas, obrigações e saldo líquido de cada evento
     */
    async getEventFinancialBalance(account_id, start_date, end_date, event_id, event_name) {
        // Verificar se a conta é MASTER (pode ver todas as contas)
        let isMasterAccount = false;
        if (account_id) {
            const account = await this.accountRepository.findOne({
                where: { id: account_id },
                select: ['id', 'level'],
            });
            isMasterAccount = account?.level === account_level_enum_1.AccountLevel.MASTER;
        }
        // Criar query builder
        const queryBuilder = this.financialEntryRepository
            .createQueryBuilder('entry')
            .leftJoinAndSelect('entry.chart_of_account', 'chart_of_account')
            .where('entry.event_id IS NOT NULL'); // Apenas entries com event_id
        // Aplicar filtros
        if (account_id && !isMasterAccount) {
            queryBuilder.andWhere('entry.account_id = :account_id', { account_id });
        }
        if (event_id) {
            queryBuilder.andWhere('entry.event_id = :event_id', { event_id });
        }
        if (event_name) {
            queryBuilder.andWhere('entry.event_name ILIKE :event_name', {
                event_name: `%${event_name}%`,
            });
        }
        if (start_date) {
            queryBuilder.andWhere('entry.entry_date >= :start_date', { start_date });
        }
        if (end_date) {
            const endDate = new Date(end_date);
            endDate.setUTCHours(23, 59, 59, 999);
            queryBuilder.andWhere('entry.entry_date <= :end_date', { end_date: endDate });
        }
        // Buscar todas as transações
        const allEntries = await queryBuilder.getMany();
        // Buscar repasses já pagos (LIABILITY DEBIT com reference_type = 'PRODUCER_PAYOUT' ou 'MANUAL_PAYOUT')
        const repaidQueryBuilder = this.financialEntryRepository
            .createQueryBuilder('entry')
            .leftJoinAndSelect('entry.chart_of_account', 'chart_of_account')
            .where('(entry.reference_type = :reference_type1 OR entry.reference_type = :reference_type2)', {
            reference_type1: 'PRODUCER_PAYOUT',
            reference_type2: 'MANUAL_PAYOUT',
        })
            .andWhere('chart_of_account.code = :code', { code: '2.1.1' })
            .andWhere('entry.type = :type', { type: financial_entry_type_enum_1.FinancialEntryType.DEBIT })
            .andWhere('entry.event_id IS NOT NULL');
        if (account_id && !isMasterAccount) {
            repaidQueryBuilder.andWhere('entry.account_id = :account_id', { account_id });
        }
        if (event_id) {
            repaidQueryBuilder.andWhere('entry.event_id = :event_id', { event_id });
        }
        if (event_name) {
            repaidQueryBuilder.andWhere('entry.event_name ILIKE :event_name', {
                event_name: `%${event_name}%`,
            });
        }
        if (start_date) {
            repaidQueryBuilder.andWhere('entry.entry_date >= :start_date', { start_date });
        }
        if (end_date) {
            const endDate = new Date(end_date);
            endDate.setUTCHours(23, 59, 59, 999);
            repaidQueryBuilder.andWhere('entry.entry_date <= :end_date', { end_date: endDate });
        }
        const repaidEntries = await repaidQueryBuilder.getMany();
        // Agrupar por event_id
        const eventsMap = new Map();
        allEntries.forEach((entry) => {
            const key = entry.event_id || 'sem-evento';
            if (!eventsMap.has(key)) {
                eventsMap.set(key, []);
            }
            eventsMap.get(key).push(entry);
        });
        // Agrupar repasses pagos por evento
        const repaidByEvent = new Map();
        repaidEntries.forEach((entry) => {
            const key = entry.event_id || 'sem-evento';
            const current = repaidByEvent.get(key) || 0;
            repaidByEvent.set(key, current + Number(entry.amount));
        });
        // Calcular saldo detalhado para cada evento
        const eventBalances = Array.from(eventsMap.entries()).map(([eventId, entries]) => {
            let totalRevenue = 0;
            let totalExpenses = 0;
            let totalLiabilities = 0;
            entries.forEach((entry) => {
                const accountType = entry.chart_of_account?.type;
                const entryType = entry.type;
                const amount = Number(entry.amount);
                // Receita: ASSET com DEBIT (entrada de dinheiro)
                if (accountType === 'ASSET' && entryType === financial_entry_type_enum_1.FinancialEntryType.DEBIT) {
                    totalRevenue += amount;
                }
                // Despesas: EXPENSE com DEBIT
                if (accountType === 'EXPENSE' && entryType === financial_entry_type_enum_1.FinancialEntryType.DEBIT) {
                    totalExpenses += amount;
                }
                // Obrigações: LIABILITY com CREDIT (dinheiro que você deve pagar)
                if (accountType === 'LIABILITY' && entryType === financial_entry_type_enum_1.FinancialEntryType.CREDIT) {
                    totalLiabilities += amount;
                }
            });
            const balance = totalRevenue - totalExpenses - totalLiabilities;
            const totalRepaid = repaidByEvent.get(eventId) || 0;
            const pendingBalance = totalLiabilities - totalRepaid;
            const sortedEntries = entries.sort((a, b) => {
                return new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime();
            });
            return {
                event_id: eventId === 'sem-evento' ? null : eventId,
                event_name: entries[0]?.event_name || null,
                total_revenue: Number(totalRevenue.toFixed(2)),
                total_expenses: Number(totalExpenses.toFixed(2)),
                total_liabilities: Number(totalLiabilities.toFixed(2)),
                total_repaid: Number(totalRepaid.toFixed(2)),
                pending_balance: Number(pendingBalance.toFixed(2)),
                balance: Number(balance.toFixed(2)),
                transaction_count: entries.length,
                first_transaction_date: sortedEntries[0]?.entry_date.toISOString() || null,
                last_transaction_date: sortedEntries[sortedEntries.length - 1]?.entry_date.toISOString() || null,
            };
        });
        // Ordenar por saldo (maior para menor)
        eventBalances.sort((a, b) => b.balance - a.balance);
        return eventBalances;
    }
    /**
     * Calcula os saldos por evento
     * Agrupa todas as transações por event_id e calcula o saldo líquido de cada evento
     */
    async getEventBalances(account_id, start_date, end_date, event_id, event_name) {
        // Verificar se a conta é MASTER (pode ver todas as contas)
        let isMasterAccount = false;
        if (account_id) {
            const account = await this.accountRepository.findOne({
                where: { id: account_id },
                select: ['id', 'level'],
            });
            isMasterAccount = account?.level === account_level_enum_1.AccountLevel.MASTER;
        }
        // Criar query builder
        const queryBuilder = this.financialEntryRepository
            .createQueryBuilder('entry')
            .leftJoinAndSelect('entry.chart_of_account', 'chart_of_account')
            .where('entry.event_id IS NOT NULL'); // Apenas entries com event_id
        // Aplicar filtros
        if (account_id && !isMasterAccount) {
            queryBuilder.andWhere('entry.account_id = :account_id', { account_id });
        }
        if (event_id) {
            queryBuilder.andWhere('entry.event_id = :event_id', { event_id });
        }
        if (event_name) {
            queryBuilder.andWhere('entry.event_name ILIKE :event_name', {
                event_name: `%${event_name}%`,
            });
        }
        if (start_date) {
            queryBuilder.andWhere('entry.entry_date >= :start_date', { start_date });
        }
        if (end_date) {
            const endDate = new Date(end_date);
            endDate.setUTCHours(23, 59, 59, 999);
            queryBuilder.andWhere('entry.entry_date <= :end_date', { end_date: endDate });
        }
        // Buscar todas as transações
        const allEntries = await queryBuilder.getMany();
        // Agrupar por event_id
        const eventsMap = new Map();
        allEntries.forEach((entry) => {
            const key = entry.event_id || 'sem-evento';
            if (!eventsMap.has(key)) {
                eventsMap.set(key, []);
            }
            eventsMap.get(key).push(entry);
        });
        // Calcular saldo para cada evento
        const eventBalances = Array.from(eventsMap.entries()).map(([eventId, entries]) => {
            const balance = this.calculateGroupTotal(entries);
            const sortedEntries = entries.sort((a, b) => {
                return new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime();
            });
            return {
                event_id: eventId === 'sem-evento' ? null : eventId,
                event_name: entries[0]?.event_name || null,
                balance: Number(balance.toFixed(2)),
                transaction_count: entries.length,
                first_transaction_date: sortedEntries[0]?.entry_date.toISOString() || null,
                last_transaction_date: sortedEntries[sortedEntries.length - 1]?.entry_date.toISOString() || null,
            };
        });
        // Ordenar por saldo (maior para menor)
        eventBalances.sort((a, b) => b.balance - a.balance);
        return eventBalances;
    }
    /**
     * Retorna totais consolidados de todos os eventos
     * Útil para dashboard e relatórios gerais
     */
    async getEventFinancialBalanceSummary(account_id, start_date, end_date, event_id, event_name) {
        // Buscar todos os saldos dos eventos
        const eventBalances = await this.getEventFinancialBalance(account_id, start_date, end_date, event_id, event_name);
        // Calcular totais
        const totals = eventBalances.reduce((acc, event) => {
            acc.total_revenue += event.total_revenue;
            acc.total_expenses += event.total_expenses;
            acc.total_liabilities += event.total_liabilities;
            acc.total_repaid += event.total_repaid;
            acc.total_pending_balance += event.pending_balance;
            acc.total_balance += event.balance;
            acc.total_transaction_count += event.transaction_count;
            return acc;
        }, {
            total_revenue: 0,
            total_expenses: 0,
            total_liabilities: 0,
            total_repaid: 0,
            total_pending_balance: 0,
            total_balance: 0,
            total_transaction_count: 0,
        });
        return {
            total_revenue: Number(totals.total_revenue.toFixed(2)),
            total_expenses: Number(totals.total_expenses.toFixed(2)),
            total_liabilities: Number(totals.total_liabilities.toFixed(2)),
            total_repaid: Number(totals.total_repaid.toFixed(2)),
            total_pending_balance: Number(totals.total_pending_balance.toFixed(2)),
            total_balance: Number(totals.total_balance.toFixed(2)),
            event_count: eventBalances.length,
            total_transaction_count: totals.total_transaction_count,
        };
    }
};
exports.FinancialEntryService = FinancialEntryService;
exports.FinancialEntryService = FinancialEntryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(financial_entry_entity_1.FinancialEntryEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(account_entity_1.AccountEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], FinancialEntryService);
