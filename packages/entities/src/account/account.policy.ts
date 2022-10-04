import { ValidationError } from '@find-me/errors';
import { AccountEntityType } from '.';
import { Policy } from '../base/policy.base';

const NICKNAME_MIN_LENGTH = 3;
const NICKNAME_MAX_LENGTH = 30;

const NICKNAME_REGEX = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,16}$/gi;

const LOWERCASE_REGEX = /[a-z]/g;
const UPPERCASE_REGEX = /[A-Z]/g;
const NUMBER_REGEX = /\d+/g;
const SPECIAL_CHARACTER = /[^A-z\s\d][\\^ _]?/g;

const PASSWORD_MIN_LENGTH = 10;
const PASSWORD_MAX_LENGTH = 30;

export class AccountPolicy extends Policy {
  private static validateNicknameLength(nickname: string): void {
    const { length } = nickname;
    if (length < NICKNAME_MIN_LENGTH || length > NICKNAME_MAX_LENGTH) {
      throw new ValidationError({
        key: 'NickNameLength',
        params: {
          min: NICKNAME_MIN_LENGTH,
          max: NICKNAME_MAX_LENGTH,
        },
      });
    }
  }

  private static validateNickname(nickname: string): void {
    if (!nickname.match(NICKNAME_REGEX)) {
      throw new ValidationError({ key: 'InvalidNickname' });
    }
  }

  private static validatePassword(password: string): void {
    const { length } = password;
    if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
      throw new ValidationError({
        key: 'PasswordLength',
        params: {
          min: PASSWORD_MIN_LENGTH,
          max: PASSWORD_MAX_LENGTH,
        },
      });
    }

    if (!password.match(NUMBER_REGEX)) {
      throw new ValidationError({ key: 'PasswordNumber' });
    }

    if (!password.match(LOWERCASE_REGEX) || !password.match(UPPERCASE_REGEX)) {
      throw new ValidationError({ key: 'PasswordLowercaseUppercase' });
    }
    if (!password.match(SPECIAL_CHARACTER)) {
      throw new ValidationError({ key: 'PasswordSpecialCharacter' });
    }
  }

  public static validate(props: AccountEntityType): void {
    AccountPolicy.validateNicknameLength(props.nickname);
    AccountPolicy.validateNickname(props.nickname);
    AccountPolicy.validatePassword(props.password);
  }
}
