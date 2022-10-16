import { database } from '@find-me/database';
import { AccountEntity } from '@find-me/entities';
import { AccountModel, DTOAccountType } from '../dto/schemas/account';
import { Repository } from './base/repository.base';
import { AccountMapper } from './mapper/account.mapper';

export class AccountRepository extends Repository<DTOAccountType, AccountEntity> {
  protected EntityModel = AccountModel;

  protected mapper = new AccountMapper(AccountEntity);

  public async findByEmail(email: string): Promise<AccountEntity | undefined> {
    const result = await this.EntityModel.findOne(
      {
        email,
      },
      undefined,

      {
        session: database.session,
      },
    )
      .populate('details')
      .populate('person')
      .exec();

    return result ? this.mapper.toDomainEntity(result.toObject()) : undefined;
  }

  public async findByNickname(nickname: string): Promise<AccountEntity | undefined> {
    const result = await this.EntityModel.findOne(
      {
        nickname,
      },
      undefined,

      {
        session: database.session,
      },
    )
      .populate('details')
      .populate('person')
      .exec();

    return result ? this.mapper.toDomainEntity(result.toObject()) : undefined;
  }
}
