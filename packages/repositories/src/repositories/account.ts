import { database } from '@find-me/database';
import { AccountEntity, AccountStatus } from '@find-me/entities';
import { AccountModel, DTOAccountType } from '../dto/schemas/account';
import { Repository } from './base/repository.base';
import { AccountMapper } from './mapper/account.mapper';

export class AccountRepository extends Repository<DTOAccountType, AccountEntity> {
  protected EntityModel = AccountModel;

  protected mapper = new AccountMapper(AccountEntity);

  public async findOneById(id: string): Promise<AccountEntity | undefined> {
    const result = await this.EntityModel.findOne(
      {
        _id: id,
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

  public async findByEmailAndIgnoreId(email: string, ignoreId: string): Promise<AccountEntity | undefined> {
    const result = await this.EntityModel.findOne(
      {
        email,
        _id: { $ne: ignoreId },
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

  public async findByNicknameAndIgnoreId(nickname: string, ignoreId: string): Promise<AccountEntity | undefined> {
    const result = await this.EntityModel.findOne(
      {
        nickname,
        _id: { $ne: ignoreId },
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

  public async passwordChange(id: string, newPassword: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          password: newPassword,
        },
      },
    ).exec();
  }

  public async activate(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          status: AccountStatus.verified,
        },
      },
      {
        session: database.session,
      },
    ).exec();
  }

  public async update(account: AccountEntity): Promise<AccountEntity> {
    const {
      id,
      nickname,
      email,
    } = account.getProps();

    const result = await this.EntityModel.findOneAndUpdate(
      {
        _id: id.value,
      },
      {
        $set: {
          nickname,
          email,
        },
      },
      {
        session: database.session,
        new: true,
      },
    ).exec();

    return this.mapper.toDomainEntity(result!.toObject());
  }
}
