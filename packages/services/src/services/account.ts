import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import {
  AccountDetailsEntity, AccountEntity, AccountEntityType, AccountStatus, CreateAccountProps,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { AccountDetailsRepository, AccountRepository } from '@find-me/repositories';
import { Authentication } from './util/authentication';

const MAX_FAILED_SIGN_IN_ATTEMPTS = 3;

export class AccountService {
  private repository: AccountRepository;

  private detailsRepository: AccountDetailsRepository;

  constructor() {
    this.repository = new AccountRepository();
    this.detailsRepository = new AccountDetailsRepository();
  }

  private async isEmailAlreadyInUse(email: string): Promise<boolean> {
    const result = await this.repository.findByEmail(email);

    return !!result;
  }

  private async isNicknameAlreadyInUse(nickname: string): Promise<boolean> {
    const result = await this.repository.findByNickname(nickname);

    return !!result;
  }

  private async createNewAccountValidation(entity: AccountEntity): Promise<void> {
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
    await this.createNewAccountValidation(entity);

    // TODO: Send verification email

    await this.detailsRepository.create(entity.getProps().details as AccountDetailsEntity);
    await this.repository.create(entity);
  }

  private async signInValidation(password: string, account?: AccountEntity): Promise<void> {
    if (!account) {
      throw new ValidationError({ key: 'InvalidEmailOrPassword' });
    }

    const {
      status,
      details,
    } = account.getProps();

    if (status === AccountStatus.disabled) {
      throw new ValidationError({ key: 'AccountIsDisabled' });
    }

    const {
      id,
      lastFailedSignInAttempt,
      failedSignInAttempts,
    } = (details as AccountDetailsEntity).getProps();

    if (lastFailedSignInAttempt && failedSignInAttempts && failedSignInAttempts > MAX_FAILED_SIGN_IN_ATTEMPTS) {
      const lastFailedSignInAttemptTimeDifference = DateVO.differenceInMinutes(DateVO.now(), lastFailedSignInAttempt);
      const signInDelay = failedSignInAttempts * 0.5;
      if (lastFailedSignInAttemptTimeDifference <= signInDelay) {
        const delay = signInDelay - lastFailedSignInAttemptTimeDifference || 1;
        throw new ValidationError({ key: 'SignInManyFailedAttempts', params: { value: delay } });
      }
    }

    if (!account.compareEncryptPassword(password)) {
      await this.detailsRepository.increaseFailedSignIn(id.value);

      throw new ValidationError({ key: 'InvalidEmailOrPassword' });
    }
  }

  public async signIn(email: string, password: string): Promise<{ account: Partial<AccountEntityType>, token: string }> {
    await database.startTransaction();
    const account = await this.repository.findByEmail(email);
    await this.repository.findOneById(account!.getProps().id.value);

    await this.signInValidation(password, account);
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
