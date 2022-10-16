import { AccountDetailsEntityType } from '@find-me/entities';
import { DTO } from '../base/dto.base';

const SCHEMA_NAME = 'AccountDetails';

class AccountDetailsSchema extends DTO<AccountDetailsEntityType> {
  public static create(): AccountDetailsSchema {
    const details = new AccountDetailsSchema({
      name: SCHEMA_NAME,
      schema: {
        _id: String,

        activationCode: String,
        activationCodeCreatedAt: Date,
        failedActivationAttempts: Number,

        recoverCode: String,
        recoverCodeCreatedAt: Date,
        failedRecoverAttempts: Number,

        lastSignInAt: Date,
        failedSignInAttempts: Number,
        lastFailedSignInAttempt: Date,

        emailUpdatedAt: Date,
      },
    });

    return details;
  }
}

const { entityModel: AccountDetailsModel, name: accountDetailsSchemaName } = AccountDetailsSchema.create();

export {
  AccountDetailsModel,
  accountDetailsSchemaName,
};
