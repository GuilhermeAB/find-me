import { UUID } from '@find-me/uuid';
import { randomBytes, scryptSync } from 'crypto';
import { AccountDetailsEntity, PersonEntity } from '..';
import { Entity } from '../base/entity.base';
import { AccountPolicy } from './account.policy';

const PASSWORD_SALT = 32;

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
    const salt = randomBytes(PASSWORD_SALT).toString('hex');
    const passwordEncrypted = scryptSync(this.props.password, salt, 32).toString('hex');

    this.props.password = `${passwordEncrypted}.${salt}`;
  }

  public compareEncryptPassword(inputPassword: string): boolean {
    const [password, salt] = this.props.password.split('.');
    const inputPasswordEncrypted = scryptSync(inputPassword, salt, 32).toString('hex');

    return inputPasswordEncrypted === password;
  }

  public validate(): void {
    AccountPolicy.validate(this.getProps());
  }

  public update(nickname?: string, email?: string): void {
    this.props.nickname = nickname || this.props.nickname;
    this.props.email = email || this.props.email;

    AccountPolicy.validateWithoutPassword(this.getProps());
  }
}
