import { AccountDetailsEntity, AccountEntity, CreateAccountProps } from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { database } from '@find-me/database';
import { AccountService } from '../index';
import { AccountMailer } from '../../util/mailer/account.mailer';

export class AccountCreateService extends AccountService {
  private async validation(entity: AccountEntity): Promise<void> {
    const {
      email,
      nickname,
    } = entity.getProps();

    const emailAlreadyInUse = await this.isEmailAlreadyInUse(email);
    if (emailAlreadyInUse) {
      throw new ValidationError({ key: 'EmailAlreadyInUse' });
    }

    const nicknameAlreadyInUse = await this.isNicknameAlreadyInUse(nickname);
    if (nicknameAlreadyInUse) {
      throw new ValidationError({ key: 'NicknameAlreadyInUse' });
    }
  }

  public async create(props: CreateAccountProps): Promise<void> {
    const entity = AccountEntity.create(props);
    entity.validate();
    entity.encryptPassword();

    await database.startTransaction();
    await this.validation(entity);

    const {
      details,
      email,
      nickname,
    } = entity.getProps();

    await this.detailsRepository.create(details as AccountDetailsEntity);
    await this.repository.create(entity);

    await AccountMailer.sendVerificationEmail(email, nickname, (details as AccountDetailsEntity).getProps().activationCode!);
  }
}
