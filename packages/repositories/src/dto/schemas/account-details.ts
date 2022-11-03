import { DTO } from '../base/dto.base';

const SCHEMA_NAME = 'Account_Details';

export interface DTOAccountDetailsType {
  _id: string,

  activationCode: string,
  activationCodeCreatedAt: Date,
  failedActivationAttempts: number,

  recoverCode: string,
  recoverCodeCreatedAt: Date,
  failedRecoverAttempts: number,

  lastSignInAt: Date,
  failedSignInAttempts: number,
  lastFailedSignInAttempt: Date,

  lastFailedPasswordChangeAttempt: Date,
  failedPasswordChangeAttempts: number,

  emailUpdatedAt: Date,
  nicknameUpdatedAt: Date,
}

class AccountDetailsSchema extends DTO<DTOAccountDetailsType> {
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

        lastFailedPasswordChangeAttempt: Date,
        failedPasswordChangeAttempts: Number,

        emailUpdatedAt: Date,
        nicknameUpdatedAt: Date,
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
