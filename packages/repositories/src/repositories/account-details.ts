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

  public async increaseFailedPasswordChange(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $inc: {
          failedPasswordChangeAttempts: 1,
        },
        $set: {
          lastFailedPasswordChangeAttempt: Date.now(),
        },
      },
    ).exec();
  }

  public async resetFailedPasswordChange(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $unset: {
          failedPasswordChangeAttempts: 0,
          lastFailedPasswordChangeAttempt: null,
        },
      },
      {
        session: database.session,
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

  public async increaseFailedActivationAttempts(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $inc: {
          failedActivationAttempts: 1,
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
        $unset: {
          failedActivationAttempts: 0,
          activationCode: null,
          activationCodeCreatedAt: null,
        },
      },
      {
        session: database.session,
      },
    );
  }

  public async changeActivationCode(id: string, code: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          failedActivationAttempts: 0,
          activationCode: code,
          activationCodeCreatedAt: new Date(),
        },
      },
      {
        session: database.session,
      },
    );
  }

  public async changePasswordRecoverCode(id: string, code: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $set: {
          recoverCode: code,
          recoverCodeCreatedAt: new Date(),
          failedRecoverAttempts: 0,
        },
      },
      {
        session: database.session,
      },
    );
  }

  public async increaseFailedPasswordRecover(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $inc: {
          failedRecoverAttempts: 1,
        },
      },
    ).exec();
  }

  public async resetFailedPasswordRecover(id: string): Promise<void> {
    await this.EntityModel.updateOne(
      {
        _id: id,
      },
      {
        $unset: {
          failedRecoverAttempts: 0,
          recoverCode: null,
          recoverCodeCreatedAt: null,
        },
      },
    ).exec();
  }
}
