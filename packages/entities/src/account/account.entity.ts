import { UUID } from '@find-me/uuid';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AccountDetailsEntity, PersonEntity } from '..';
import { Entity } from '../base/entity.base';
import { AccountPolicy } from './account.policy';

const PASSWORD_SALT = 10;

export enum AccountRole {
  default = 'default',
  admin = 'admin',
}

export enum AccountStatus {
  unverified = 'unverified',
  verified = 'verified',
  disabled = 'disabled',
}

export interface AccountProps {
  nickname: string,
  email: string,
  password: string,
  role: AccountRole,
  status: AccountStatus,
  person: UUID | PersonEntity,
  details: UUID | AccountDetailsEntity,
}

export interface CreateAccountProps {
  nickname: string,
  email: string,
  password: string,
  person: UUID | PersonEntity,
}

export class AccountEntity extends Entity<AccountProps> {
  public static create(create: CreateAccountProps): AccountEntity {
    const details = AccountDetailsEntity.create();
    const props: AccountProps = {
      ...create,
      nickname: create.nickname.trim(),
      email: create.email.trim(),
      role: AccountRole.default,
      status: AccountStatus.unverified,
      details,
    };

    const account = new AccountEntity({ props });

    return account;
  }

  public set password(newPassword: string) {
    this.props.password = newPassword;
  }

  public encryptPassword(): void {
    this.props.password = hashSync(this.props.password, genSaltSync(PASSWORD_SALT));
  }

  public compareEncryptPassword(inputPassword: string): boolean {
    return compareSync(inputPassword, this.props.password);
  }

  public validate(): void {
    AccountPolicy.validate(this.getProps());
  }
}
