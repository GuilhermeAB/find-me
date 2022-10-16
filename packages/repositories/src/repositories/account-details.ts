import { database } from '@find-me/database';
import { AccountDetailsEntity } from '@find-me/entities';
import { AccountDetailsModel, DTOAccountDetailsType } from '../dto/schemas/account-details';
import { Repository } from './base/repository.base';
import { AccountDetailsMapper } from './mapper/account-details.mapper';

export class AccountDetailsRepository extends Repository<DTOAccountDetailsType, AccountDetailsEntity> {
  protected EntityModel = AccountDetailsModel;

  protected mapper = new AccountDetailsMapper(AccountDetailsEntity);

  public async increaseFailedSignIn(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $inc: {
          failedSignInAttempts: 1,
        },
        $set: {
          lastFailedSignInAttempt: Date.now(),
        },
      },
    ).exec();
  }

  public async saveLastSignIn(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          lastSignInAt: Date.now(),
        },
        $unset: {
          failedSignInAttempts: 0,
          lastFailedSignInAttempt: null,
        },
      },
      {
        session: database.session,
      },
    );
  }
}
