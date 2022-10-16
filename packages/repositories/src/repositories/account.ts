import { database } from '@find-me/database';
import { AccountEntity, AccountEntityType } from '@find-me/entities';
import { AccountModel } from '../dto/schemas/account';
import { Repository } from './base/repository.base';
import { AccountMapper } from './mapper/account.mapper';

export class AccountRepository extends Repository<AccountEntityType, AccountEntity> {
  protected EntityModel = AccountModel;

  protected mapper = new AccountMapper(AccountEntity);

  public async getByEmail(email: string): Promise<AccountEntity | undefined> {
    const result = await this.EntityModel.findOne(
      {
        email,
      },
      undefined,

      {
        session: database.session,
      },
    ).exec();

    return result ? this.mapper.toDomainEntity(result.toObject()) : undefined;
  }
}
