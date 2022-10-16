import { DTO } from '../base/dto.base';
import { accountDetailsSchemaName, DTOAccountDetailsType } from './account-details';
import { DTOPersonType, personSchemaName } from './person';

const SCHEMA_NAME = 'Account';

export interface DTOAccountType {
  _id: string,
  nickname: string,
  email: string,
  password: string,
  role: string,
  status: string,
  person: string | DTOPersonType,
  details: string | DTOAccountDetailsType,
  createdAt: Date,
  updatedAt: Date,
}

class AccountSchema extends DTO<DTOAccountType> {
  public static create(): AccountSchema {
    const account = new AccountSchema({
      name: SCHEMA_NAME,
      schema: {
        _id: String,
        nickname: String,
        email: String,
        password: String,
        role: String,
        status: String,

        person: { type: String, ref: personSchemaName },
        details: { type: String, ref: accountDetailsSchemaName },
      },
      options: {
        timestamps: true,
      },
    });

    return account;
  }
}

const { entityModel: AccountModel, name: accountSchemaName } = AccountSchema.create();

export {
  AccountModel,
  accountSchemaName,
};
