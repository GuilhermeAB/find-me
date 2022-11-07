import {
  AccountDetailsEntity, AccountEntity,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';
import { AccountMailer } from '../../util/mailer/account.mailer';

const PASSWORD_RECOVER_REQUEST_DELAY_MINUTES = 5;

export class AccountPasswordRequestRecoverService extends AccountService {
  private static validation(account: AccountEntity): void {
    const {
      status,
      details,
    } = account.getProps();

    if (AccountService.accountIsDisabled(status)) {
      throw new ValidationError({ key: 'AccountDisabled' });
    }

    const {
      recoverCodeCreatedAt,
    } = (details as AccountDetailsEntity).getProps();
    if (recoverCodeCreatedAt) {
      const delay = DateVO.differenceInMinutes(DateVO.now(), recoverCodeCreatedAt);

      if (delay <= PASSWORD_RECOVER_REQUEST_DELAY_MINUTES) {
        throw new ValidationError({ key: 'PasswordRecoverRequestManyAttempts', params: { value: (PASSWORD_RECOVER_REQUEST_DELAY_MINUTES - delay) || 1 } });
      }
    }
  }

  public async passwordRequestRecoverCode(email: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findByEmail(email);
    if (!account) {
      throw new ValidationError({ key: 'AccountNotFound' });
    }

    AccountPasswordRequestRecoverService.validation(account);

    const {
      details,
      nickname,
    } = account.getProps();
    (details as AccountDetailsEntity).updateRecoverCode();

    const {
      id,
      recoverCode,
    } = (details as AccountDetailsEntity).getProps();

    await this.detailsRepository.changePasswordRecoverCode(id.value, recoverCode!);

    await AccountMailer.sendPasswordRecoverEmail(email, nickname, recoverCode!);
  }
}
