import {
  AccountDetailsEntity, AccountEntity,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';

const MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS = 2;

export class AccountPasswordChangeService extends AccountService {
  private static validationFailedAttemptsDelay(details: AccountDetailsEntity): void {
    const {
      lastFailedPasswordChangeAttempt,
      failedPasswordChangeAttempts,
    } = details.getProps();

    if (!lastFailedPasswordChangeAttempt || !failedPasswordChangeAttempts) {
      return;
    }

    if (failedPasswordChangeAttempts > MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS) {
      const lastFailedPasswordChangeAttemptTimeDifference = DateVO.differenceInMinutes(DateVO.now(), lastFailedPasswordChangeAttempt);
      const passwordChangeDelay = failedPasswordChangeAttempts * 0.5;

      if (lastFailedPasswordChangeAttemptTimeDifference <= passwordChangeDelay) {
        const delay = passwordChangeDelay - lastFailedPasswordChangeAttemptTimeDifference || 1;
        throw new ValidationError({ key: 'PasswordChangeManyFailedAttempts', params: { value: delay } });
      }
    }
  }

  private async passwordIsValid(account: AccountEntity, password: string): Promise<void> {
    if (!account.compareEncryptPassword(password)) {
      const {
        id,
      } = (account.getProps().details as AccountDetailsEntity).getProps();

      await this.detailsRepository.increaseFailedPasswordChange(id.value);

      throw new ValidationError({ key: 'InvalidPassword' });
    }
  }

  private async validation(account: AccountEntity, currentPassword: string): Promise<void> {
    const {
      details,
      status,
    } = account.getProps();

    if (!AccountService.accountIsVerified(status)) {
      throw new ValidationError({ key: 'AccountNotVerified' });
    }

    AccountPasswordChangeService.validationFailedAttemptsDelay(details as AccountDetailsEntity);

    await this.passwordIsValid(account, currentPassword);
  }

  public async passwordChange(accountId: string, newPassword: string, currentPassword: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findOneById(accountId);
    await this.validation(account!, currentPassword);

    account!.password = newPassword;
    account!.validate();
    account!.encryptPassword();

    if (account!.compareEncryptPassword(currentPassword)) {
      throw new ValidationError({ key: 'PasswordChangeSamePasswords' });
    }

    const {
      id,
      password,
      details,
    } = account!.getProps();

    await this.repository.passwordChange(id.value, password);
    await this.detailsRepository.resetFailedPasswordChange((details as AccountDetailsEntity).getProps().id.value);
  }
}
