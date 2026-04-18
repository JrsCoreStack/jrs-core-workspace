import { DataSource } from 'typeorm';
import { ChartOfAccountsType } from 'src/utils/enums/chart_of_accounts_type.enum';
import { FinancialChartOfAccountsEntity } from 'src/modules/financial_chart_of_accounts/entities/financial_chart_of_accounts.entity';

export async function seedChartOfAccounts(
  dataSource: DataSource,
  account_id: string,
) {
  const repository = dataSource.getRepository(FinancialChartOfAccountsEntity);

  await repository.delete({ account_id });

  /**
   * =========================
   * ATIVOS
   * =========================
   */
  const ativos = await repository.save(
    repository.create({
      account_id,
      code: '1',
      name: 'Ativos',
      type: ChartOfAccountsType.ASSET,
    }),
  );

  const caixaEquivalentes = await repository.save(
    repository.create({
      account_id,
      code: '1.1',
      name: 'Caixa e Equivalentes',
      type: ChartOfAccountsType.ASSET,
      parent: ativos,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '1.1.1',
      name: 'Conta Bancária',
      type: ChartOfAccountsType.ASSET,
      parent: caixaEquivalentes,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '1.1.2',
      name: 'Gateway de Pagamento',
      type: ChartOfAccountsType.ASSET,
      parent: caixaEquivalentes,
    }),
  );

  /**
   * =========================
   * PASSIVOS
   * =========================
   */
  const passivos = await repository.save(
    repository.create({
      account_id,
      code: '2',
      name: 'Passivos',
      type: ChartOfAccountsType.LIABILITY,
    }),
  );

  const valoresARepassar = await repository.save(
    repository.create({
      account_id,
      code: '2.1',
      name: 'Valores a Repassar',
      type: ChartOfAccountsType.LIABILITY,
      parent: passivos,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '2.1.1',
      name: 'Repasse a Produtor',
      type: ChartOfAccountsType.LIABILITY,
      parent: valoresARepassar,
    }),
  );

  /**
   * =========================
   * RECEITAS
   * =========================
   */
  const receitas = await repository.save(
    repository.create({
      account_id,
      code: '3',
      name: 'Receitas',
      type: ChartOfAccountsType.INCOME,
    }),
  );

  const receitaOperacional = await repository.save(
    repository.create({
      account_id,
      code: '3.1',
      name: 'Receita Operacional',
      type: ChartOfAccountsType.INCOME,
      parent: receitas,
    }),
  );

  const taxasAdministrativas = await repository.save(
    repository.create({
      account_id,
      code: '3.1.1',
      name: 'Taxas Administrativas',
      type: ChartOfAccountsType.INCOME,
      parent: receitaOperacional,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '3.1.1.1',
      name: 'Taxa Administrativa - Cliente Final',
      type: ChartOfAccountsType.INCOME,
      parent: taxasAdministrativas,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '3.1.1.2',
      name: 'Taxa Administrativa - Produtor',
      type: ChartOfAccountsType.INCOME,
      parent: taxasAdministrativas,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '3.1.1.3',
      name: 'Spread - Cliente Final',
      type: ChartOfAccountsType.INCOME,
      parent: taxasAdministrativas,
    }),
  );

  /**
   * =========================
   * DESPESAS
   * =========================
   */
  const despesas = await repository.save(
    repository.create({
      account_id,
      code: '4',
      name: 'Despesas',
      type: ChartOfAccountsType.EXPENSE,
    }),
  );

  const custosFinanceiros = await repository.save(
    repository.create({
      account_id,
      code: '4.1',
      name: 'Custos Financeiros',
      type: ChartOfAccountsType.EXPENSE,
      parent: despesas,
    }),
  );

  await repository.save(
    repository.create({
      account_id,
      code: '4.1.1',
      name: 'Taxas de Gateway',
      type: ChartOfAccountsType.EXPENSE,
      parent: custosFinanceiros,
    }),
  );

}
