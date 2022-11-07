import {
  AccountDetailsEntity, AccountEntity,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';
import { AccountMailer } from '../../util/mailer/account.mailer';

const ACTIVATION_CODE_REQUEST_DELAY_MINUTES = 4;

export class AccountActivationRequestNewCodeService extends AccountService {
  private static validation(account: AccountEntity): void {
    const {
      status,
      details,
    } = account.getProps();

    if (!AccountService.accountIsUnverified(status)) {
      throw new ValidationError({ key: 'CantRequestNewActivationCode', params: { value: status } });
    }

    const {
      activationCodeCreatedAt,
    } = (details as AccountDetailsEntity).getProps();

    const delay = DateVO.differenceInMinutes(DateVO.now(), activationCodeCreatedAt!);
    if (delay <= ACTIVATION_CODE_REQUEST_DELAY_MINUTES) {
      throw new ValidationError({ key: 'ActivationCodeRequestManyAttempts', params: { value: (ACTIVATION_CODE_REQUEST_DELAY_MINUTES - delay) || 1 } });
    }
  }

  public async requestNewCode(accountId: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findOneById(accountId);
    if (!account) {
      throw new ValidationError({ key: 'AccountNotFound' });
    }

    AccountActivationRequestNewCodeService.validation(account);

    (account.getProps().details as AccountDetailsEntity).updateActivationCode();

    const {
      details,
      email,
      nickname,
    } = account.getProps();

    const {
      id,
      activationCode,
    } = (details as AccountDetailsEntity).getProps();

    await this.detailsRepository.changeActivationCode(id.value, activationCode!);

    await AccountMailer.sendVerificationEmail(email, nickname, (details as AccountDetailsEntity).getProps().activationCode!);
  }
}
