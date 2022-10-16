import { AccountEntityType } from '@find-me/entities';
import { DTO } from '../base/dto.base';
import { accountDetailsSchemaName } from './account-details';
import { personSchemaName } from './person';

const SCHEMA_NAME = 'Account';

class AccountSchema extends DTO<AccountEntityType> {
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
