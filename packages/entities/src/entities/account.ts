import { ValidationError } from '@find-me/errors';
import { UUID } from '@find-me/uuid';
import { hashSync, genSaltSync, compareSync } from 'bcrypt';
import { BaseEntityProps, Entity } from '../base/entity.base';
import { AccountDetailsEntity } from './account-details';
import { PersonEntity } from './person';

const NICKNAME_MIN_LENGTH = 3;
const NICKNAME_MAX_LENGTH = 30;

const NICKNAME_REGEX = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,16}$/gi;

const LOWERCASE_REGEX = /[a-z]/g;
const UPPERCASE_REGEX = /[A-Z]/g;
const NUMBER_REGEX = /\d+/g;
const SPECIAL_CHARACTER = /[^A-z\s\d][\\^ _]?/g;

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 30;

const PASSWORD_SALT = 10;

enum AccountRole {
  default = 'default',
  admin = 'admin',
}

enum AccountStatus {
  unverified = 'unverified',
  verified = 'verified',
  disabled = 'disabled',
}

interface AccountProps {
  nickname: string,
  email: string,
  password: string,
  role: AccountRole,
  status: AccountStatus,
  person: UUID | PersonEntity,
  details: UUID | AccountDetailsEntity,
}

interface CreateAccountProps {
  nickname: string,
  email: string,
  password: string,
  person: UUID,
}

export interface AccountEntityType extends AccountProps, BaseEntityProps {}

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

  public encryptPassword(): string {
    return hashSync(this.props.password, genSaltSync(PASSWORD_SALT));
  }

  public static compareEncryptPassword(password: string, encryptedPassword: string): boolean {
    return compareSync(password, encryptedPassword);
  }

  private validateNicknameLength(): void {
    const { length } = this.props.nickname;
    if (length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH) {
      throw new ValidationError({
        code: 'NICKNAME_LENGTH',
        params: {
          min: NICKNAME_MIN_LENGTH,
          max: NICKNAME_MAX_LENGTH,
        },
      });
    }
  }

  private validateNickname(): void {
    if (!this.props.nickname.match(NICKNAME_REGEX)) {
      throw new ValidationError({ code: 'INVALID_NICKNAME' });
    }
  }

  private validatePassword(): void {
    const { length } = this.props.password;
    if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
      throw new ValidationError({
        code: 'PASSWORD_LENGTH',
        params: {
          min: PASSWORD_MIN_LENGTH,
          max: PASSWORD_MAX_LENGTH,
        },
      });
    }

    if (!this.props.password.match(NUMBER_REGEX)) {
      throw new ValidationError({ code: 'PASSWORD_NUMBER' });
    }

    if (!this.props.password.match(LOWERCASE_REGEX) || !this.props.password.match(UPPERCASE_REGEX)) {
      throw new ValidationError({ code: 'PASSWORD_LOWERCASE_UPPERCASE' });
    }
    if (!this.props.password.match(SPECIAL_CHARACTER)) {
      throw new ValidationError({ code: 'PASSWORD_SPECIAL_CHARACTER' });
    }
  }

  public validate(): void {
    this.validateNicknameLength();
    this.validateNickname();
    this.validatePassword();
  }
}
