import { DataSource } from 'typeorm';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { AccountType } from 'src/utils/enums/account_type.enum';
import { AccountLevel } from 'src/utils/enums/account_level.enum';

export async function seedAccounts(dataSource: DataSource) {
  const repository = dataSource.getRepository(AccountEntity);

  await repository.delete({ code: 'oticket-grupo' });
  await repository.delete({ code: 'jrs-external-sales' });
  await repository.delete({ code: 'oticket-play' });

  const grupoOticket = repository.create({
    name: 'Grupo OTicket',
    code: 'oticket-grupo',
    email: 'grupo@oticket.com.br',
    type: AccountType.OTICKET_GRUPO as number,
    level: AccountLevel.MASTER,
  });
  await repository.save(grupoOticket);

  const contaVendasExterna = repository.create({
    name: 'Vendas — projeto integrado',
    code: 'jrs-external-sales',
    email: 'vendas-integracao@jrs.local',
    type: AccountType.JRS_EXTERNAL_SALES as number,
    level: AccountLevel.OPERATIONAL,
  });
  await repository.save(contaVendasExterna);

  const oticketPlay = repository.create({
    name: 'OTicket Play',
    code: 'oticket-play',
    email: 'play@oticket.com.br',
    type: AccountType.OTICKET_PLAY as number,
    level: AccountLevel.OPERATIONAL,
  });
  await repository.save(oticketPlay);



  return {
    grupoOticket,
    contaVendasExterna,
    oticketPlay,
  };
}
