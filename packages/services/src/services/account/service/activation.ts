import {
  AccountDetailsEntity, AccountEntity,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';

const MAX_FAILED_ACTIVATION_ATTEMPTS = 3;
const ACTIVATION_CODE_EXPIRE_INTERVAL = 30;

export class AccountActivationService extends AccountService {
  private async validation(account: AccountEntity, code: string): Promise<void> {
    const {
      status,
      details,
    } = account.getProps();

    if (!AccountService.accountIsUnverified(status)) {
      throw new ValidationError({ key: 'CantActivateAccount', params: { value: status } });
    }

    const {
      id,
      activationCode,
      activationCodeCreatedAt,
      failedActivationAttempts,
    } = (details as AccountDetailsEntity).getProps();

    if (failedActivationAttempts && failedActivationAttempts >= MAX_FAILED_ACTIVATION_ATTEMPTS) {
      throw new ValidationError({ key: 'ManyInvalidActivationAttempts' });
    }

    if (DateVO.differenceInMinutes(DateVO.now(), activationCodeCreatedAt!) >= ACTIVATION_CODE_EXPIRE_INTERVAL) {
      throw new ValidationError({ key: 'ActivationCodeExpired' });
    }

    if (activationCode !== code) {
      await this.detailsRepository.increaseFailedActivationAttempts(id.value);

      throw new ValidationError({ key: 'ActivationCodeInvalid' });
    }
  }

  public async activate(id: string, code: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findOneById(id);

    await this.validation(account!, code);

    await this.repository.activate(id);

    const {
      details,
    } = account!.getProps();

    await this.detailsRepository.activate((details as AccountDetailsEntity).getProps().id.value);
  }
}
