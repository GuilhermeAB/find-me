import {
  AccountDetailsEntity, AccountEntity, AccountEntityType,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';
import { Authentication } from '../../util/authentication';

const MAX_FAILED_SIGN_IN_ATTEMPTS = 3;

export class AccountSignInService extends AccountService {
  private static validationFailedAttemptsDelay(details: AccountDetailsEntity): void {
    const {
      lastFailedSignInAttempt,
      failedSignInAttempts,
    } = details.getProps();

    if (!lastFailedSignInAttempt || !failedSignInAttempts) {
      return;
    }

    if (failedSignInAttempts > MAX_FAILED_SIGN_IN_ATTEMPTS) {
      const lastFailedSignInAttemptTimeDifference = DateVO.differenceInMinutes(DateVO.now(), lastFailedSignInAttempt);
      const signInDelay = failedSignInAttempts * 0.5;

      if (lastFailedSignInAttemptTimeDifference <= signInDelay) {
        const delay = signInDelay - lastFailedSignInAttemptTimeDifference || 1;
        throw new ValidationError({ key: 'SignInManyFailedAttempts', params: { value: delay } });
      }
    }
  }

  private async passwordIsValid(account: AccountEntity, password: string): Promise<void> {
    if (!account.compareEncryptPassword(password)) {
      const {
        id,
      } = (account.getProps().details as AccountDetailsEntity).getProps();

      await this.detailsRepository.increaseFailedSignIn(id.value);

      throw new ValidationError({ key: 'InvalidEmailOrPassword' });
    }
  }

  private async validation(password: string, account?: AccountEntity): Promise<void> {
    if (!account) {
      throw new ValidationError({ key: 'InvalidEmailOrPassword' });
    }

    const {
      status,
      details,
    } = account.getProps();

    if (AccountService.accountIsDisabled(status)) {
      throw new ValidationError({ key: 'AccountIsDisabled' });
    }

    AccountSignInService.validationFailedAttemptsDelay(details as AccountDetailsEntity);

    await this.passwordIsValid(account, password);
  }

  public async signIn(password: string, email?: string, nickname?: string): Promise<{ account: Partial<AccountEntityType>, token: string }> {
    await database.startTransaction();
    const account = email ? await this.repository.findByEmail(email) : await this.repository.findByNickname(nickname!);

    await this.validation(password, account);
    const token = Authentication.generateToken(account!);

    await this.detailsRepository.saveLastSignIn((account!.getProps().details as AccountDetailsEntity).getProps().id.value);

    return {
      token,
      account: {
        ...account!.getFlatProps(),
        password: undefined,
        details: undefined,
      },
    };
  }
}
