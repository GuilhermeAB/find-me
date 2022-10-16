import { AccountDetailsEntity, AccountDetailsEntityType } from '@find-me/entities';
import { AccountDetailsModel } from '../dto/schemas/account-details';
import { Repository } from './base/repository.base';
import { AccountDetailsMapper } from './mapper/account-details.mapper';

export class AccountDetailsRepository extends Repository<AccountDetailsEntityType, AccountDetailsEntity> {
  protected EntityModel = AccountDetailsModel;

  protected mapper = new AccountDetailsMapper(AccountDetailsEntity);
}
