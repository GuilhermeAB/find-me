import { DateVO } from '@find-me/date';
import { Entity } from '../base/entity.base';

export const RANDOM_CODE_LENGTH = 8;

function generateRandomCode(length: number, value?: string): string {
  if (value && value.length >= length) {
    return value;
  }

  return generateRandomCode(length, `${value || ''}${Math.floor(Math.random() * 10)}`);
}

interface AccountDetailsActivationData {
  activationCode?: string,
  activationCodeCreatedAt?: DateVO,
  failedActivationAttempts?: number,
}

interface AccountDetailsRecoverData {
  recoverCode?: string,
  recoverCodeCreatedAt?: DateVO,
  failedRecoverAttempts?: number,
}

interface AccountDetailsSignInData {
  lastSignInAt?: DateVO,
  failedSignInAttempts?: number,
  lastFailedSignInAttempt?: DateVO,
}

interface AccountDetailsPasswordChange {
  lastFailedPasswordChangeAttempt?: DateVO,
  failedPasswordChangeAttempts?: number,
}

export interface AccountDetailsProps extends
  AccountDetailsActivationData,
  AccountDetailsRecoverData,
  AccountDetailsSignInData,
  AccountDetailsPasswordChange {
  emailUpdatedAt?: DateVO,
}

export class AccountDetailsEntity extends Entity<AccountDetailsProps> {
  public static create(): AccountDetailsEntity {
    const props: AccountDetailsProps = {
      ...AccountDetailsEntity.generateActivationCode(),
    };

    const details = new AccountDetailsEntity({ props });

    return details;
  }

  private static generateRandomCode(): string {
    return generateRandomCode(RANDOM_CODE_LENGTH);
  }

  private static generateActivationCode(): AccountDetailsActivationData {
    return {
      activationCode: AccountDetailsEntity.generateRandomCode(),
      activationCodeCreatedAt: DateVO.now(),
      failedActivationAttempts: 0,
    };
  }

  public updateActivationCode(): void {
    const { activationCode, activationCodeCreatedAt, failedActivationAttempts } = AccountDetailsEntity.generateActivationCode();

    this.props.activationCode = activationCode;
    this.props.activationCodeCreatedAt = activationCodeCreatedAt;
    this.props.failedActivationAttempts = failedActivationAttempts;
  }

  public updateRecoverCode(): void {
    this.props.recoverCode = AccountDetailsEntity.generateRandomCode();
    this.props.recoverCodeCreatedAt = DateVO.now();
    this.props.failedRecoverAttempts = 0;
  }

  public setEmailUpdatedAt(): void {
    this.props.emailUpdatedAt = DateVO.now();
  }

  public setLastSignIn(): void {
    this.props.lastSignInAt = DateVO.now();
    this.props.failedSignInAttempts = 0;
    this.props.lastFailedSignInAttempt = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  public validate(): void {
  }
}
