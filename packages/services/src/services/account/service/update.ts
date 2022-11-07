import {
  AccountDetailsEntity, AccountEntity, AccountEntityType,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import { AccountService } from '../index';

const UPDATE_EMAIL_NICKNAME_DELAY_DAYS = 60;

export class AccountUpdateService extends AccountService {
  private async updateEmailValidation(account: AccountEntity): Promise<void> {
    const {
      id,
      email,
      status,
      details,
    } = account.getProps();

    if (!AccountService.accountIsVerified(status)) {
      throw new ValidationError({ key: 'AccountNotVerified' });
    }

    const emailAlreadyInUse = await this.repository.findByEmailAndIgnoreId(email, id.value);
    if (emailAlreadyInUse) {
      throw new ValidationError({ key: 'EmailAlreadyInUse' });
    }

    const {
      emailUpdatedAt,
    } = (details as AccountDetailsEntity).getProps();

    const emailUpdateDelay = emailUpdatedAt && DateVO.differenceInDays(DateVO.now(), emailUpdatedAt);
    if (emailUpdateDelay !== undefined && emailUpdateDelay < UPDATE_EMAIL_NICKNAME_DELAY_DAYS) {
      throw new ValidationError({ key: 'EmailUpdateDelay', params: { value: UPDATE_EMAIL_NICKNAME_DELAY_DAYS - emailUpdateDelay } });
    }
  }

  private async updateNicknameValidation(account: AccountEntity): Promise<void> {
    const {
      id,
      nickname,
      status,
      details,
    } = account.getProps();

    if (!AccountService.accountIsVerified(status)) {
      throw new ValidationError({ key: 'AccountNotVerified' });
    }

    const nicknameAlreadyInUse = await this.repository.findByNicknameAndIgnoreId(nickname, id.value);
    if (nicknameAlreadyInUse) {
      throw new ValidationError({ key: 'NicknameAlreadyInUse' });
    }

    const {
      nicknameUpdatedAt,
    } = (details as AccountDetailsEntity).getProps();

    const nicknameUpdateDelay = nicknameUpdatedAt && DateVO.differenceInDays(DateVO.now(), nicknameUpdatedAt);
    if (nicknameUpdateDelay !== undefined && nicknameUpdateDelay < UPDATE_EMAIL_NICKNAME_DELAY_DAYS) {
      throw new ValidationError({ key: 'NicknameUpdateDelay', params: { value: UPDATE_EMAIL_NICKNAME_DELAY_DAYS - nicknameUpdateDelay } });
    }
  }

  public async update(id: string, newNickname?: string, newEmail?: string): Promise<Partial<AccountEntityType>> {
    await database.startTransaction();
    const account = await this.repository.findOneById(id);
    if (!account) {
      throw new ValidationError({ key: 'AccountNotFound' });
    }

    const {
      email,
      nickname,
      details,
    } = account.getProps();

    const {
      id: detailsId,
    } = (details as AccountDetailsEntity).getProps();

    if (newEmail && email !== newEmail) {
      account.update(undefined, newEmail);
      await this.updateEmailValidation(account);
      await this.detailsRepository.setUpdateEmail(detailsId.value);
    }

    if (newNickname && nickname !== newNickname) {
      account.update(newNickname, undefined);
      await this.updateNicknameValidation(account);
      await this.detailsRepository.setUpdateNickname(detailsId.value);
    }

    const result = await this.repository.update(account);

    return {
      ...result.getFlatProps(),
      password: undefined,
      details: undefined,
    };
  }
}
