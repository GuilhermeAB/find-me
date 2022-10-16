import { AccountEntity, AccountEntityType } from '@find-me/entities';
import { AccountModel } from '../dto/schemas/account';
import { Repository } from './base/repository.base';
import { AccountMapper } from './mapper/account.mapper';

export class AccountRepository extends Repository<AccountEntityType, AccountEntity> {
  protected EntityModel = AccountModel;

  protected mapper = new AccountMapper(AccountEntity);
}
