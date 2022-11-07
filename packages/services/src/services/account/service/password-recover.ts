import {
  AccountDetailsEntity, AccountEntity,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';

const MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS = 2;
const PASSWORD_RECOVER_CODE_EXPIRATION_MINUTES = 15;

export class AccountPasswordRecoverService extends AccountService {
  private async validation(account: AccountEntity, code: string): Promise<void> {
    const {
      details,
    } = account.getProps();

    const {
      id,
      recoverCode,
      recoverCodeCreatedAt,
      failedRecoverAttempts,
    } = (details as AccountDetailsEntity).getProps();

    if (!recoverCodeCreatedAt || !recoverCode) {
      throw new ValidationError({ key: 'AccountNotRequestedRecover' });
    }

    if (failedRecoverAttempts && failedRecoverAttempts > MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS) {
      throw new ValidationError({ key: 'PasswordRecoverMaxAttempts' });
    }

    if (DateVO.differenceInMinutes(DateVO.now(), recoverCodeCreatedAt) >= PASSWORD_RECOVER_CODE_EXPIRATION_MINUTES) {
      throw new ValidationError({ key: 'PasswordRecoverCodeExpired' });
    }

    if (recoverCode !== code) {
      await this.detailsRepository.increaseFailedPasswordRecover(id.value);

      throw new ValidationError({ key: 'PasswordRecoverCodeInvalid' });
    }
  }

  public async passwordRecover(email: string, code: string, newPassword: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findByEmail(email);

    if (!account) {
      throw new ValidationError({ key: 'AccountNotFound' });
    }

    await this.validation(account, code);

    if (account.compareEncryptPassword(newPassword)) {
      throw new ValidationError({ key: 'PasswordChangeSamePasswords' });
    }

    account.password = newPassword;
    account.validate();
    account.encryptPassword();

    const {
      id,
      password,
      details,
    } = account.getProps();

    await this.repository.passwordChange(id.value, password);
    await this.detailsRepository.resetFailedPasswordRecover((details as AccountDetailsEntity).getProps().id.value);
  }
}
