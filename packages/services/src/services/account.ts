import { database } from '@find-me/database';
import { DateVO } from '@find-me/date';
import {
  AccountDetailsEntity, AccountEntity, AccountEntityType, AccountStatus, CreateAccountProps,
} from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { AccountDetailsRepository, AccountRepository } from '@find-me/repositories';
import { Authentication } from './util/authentication';

const MAX_FAILED_SIGN_IN_ATTEMPTS = 3;
const MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS = 2;
const MAX_FAILED_ACTIVATION_ATTEMPTS = 3;
const ACTIVATION_CODE_EXPIRE_INTERVAL = 30;
const ACTIVATION_CODE_REQUEST_DELAY_MINUTES = 4;
const PASSWORD_RECOVER_REQUEST_DELAY_MINUTES = 5;

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

  private async passwordChangeValidation(account: AccountEntity, currentPassword: string): Promise<void> {
    const {
      details,
    } = account.getProps();

    const {
      id,
      lastFailedPasswordChangeAttempt,
      failedPasswordChangeAttempts,
    } = (details as AccountDetailsEntity).getProps();

    if (lastFailedPasswordChangeAttempt && failedPasswordChangeAttempts && failedPasswordChangeAttempts > MAX_FAILED_PASSWORD_CHANGE_ATTEMPTS) {
      const lastFailedPasswordChangeAttemptTimeDifference = DateVO.differenceInMinutes(DateVO.now(), lastFailedPasswordChangeAttempt);
      const passwordChangeDelay = failedPasswordChangeAttempts * 0.5;
      if (lastFailedPasswordChangeAttemptTimeDifference <= passwordChangeDelay) {
        const delay = passwordChangeDelay - lastFailedPasswordChangeAttemptTimeDifference || 1;
        throw new ValidationError({ key: 'PasswordChangeManyFailedAttempts', params: { value: delay } });
      }
    }

    if (!account.compareEncryptPassword(currentPassword)) {
      await this.detailsRepository.increaseFailedPasswordChange(id.value);

      throw new ValidationError({ key: 'InvalidPassword' });
    }
  }

  public async passwordChange(accountId: string, newPassword: string, currentPassword: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findOneById(accountId);
    await this.passwordChangeValidation(account!, currentPassword);

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

  private async activationValidation(account: AccountEntity, code: string): Promise<void> {
    const {
      status,
      details,
    } = account.getProps();

    if (status !== AccountStatus.unverified) {
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

    await this.activationValidation(account!, code);

    await this.repository.activate(id);

    const {
      details,
    } = account!.getProps();

    await this.detailsRepository.activate((details as AccountDetailsEntity).getProps().id.value);
  }

  private static activateRequestNewCodeValidation(account: AccountEntity): void {
    const {
      status,
      details,
    } = account.getProps();

    if (status !== AccountStatus.unverified) {
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

  public async activateRequestNewCode(accountId: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findOneById(accountId);
    if (!account) {
      throw new ValidationError({ key: 'AccountNotFound' });
    }

    AccountService.activateRequestNewCodeValidation(account);

    (account.getProps().details as AccountDetailsEntity).updateActivationCode();
    const {
      id,
      activationCode,
    } = (account.getProps().details as AccountDetailsEntity).getProps();

    await this.detailsRepository.changeActivationCode(id.value, activationCode!);
    // TODO: Send email
  }

  private static passwordRequestRecoverCodeValidation(account: AccountEntity): void {
    const {
      status,
      details,
    } = account.getProps();

    if (status === AccountStatus.disabled) {
      throw new ValidationError({ key: 'AccountDisabled' });
    }

    const {
      recoverCodeCreatedAt,
    } = (details as AccountDetailsEntity).getProps();
    if (recoverCodeCreatedAt) {
      const delay = DateVO.differenceInMinutes(DateVO.now(), recoverCodeCreatedAt);

      if (delay <= PASSWORD_RECOVER_REQUEST_DELAY_MINUTES) {
        throw new ValidationError({ key: 'PasswordRecoverRequestManyAttempts', params: { value: (2 - PASSWORD_RECOVER_REQUEST_DELAY_MINUTES) || 1 } });
      }
    }
  }

  public async passwordRequestRecoverCode(email: string): Promise<void> {
    await database.startTransaction();
    const account = await this.repository.findByEmail(email);
    if (!account) {
      throw new ValidationError({ key: 'AccountNotFound' });
    }

    AccountService.passwordRequestRecoverCodeValidation(account);

    const {
      details,
    } = account.getProps();
    (details as AccountDetailsEntity).updateRecoverCode();

    const {
      id,
      recoverCode,
    } = (details as AccountDetailsEntity).getProps();

    await this.detailsRepository.changePasswordRecoverCode(id.value, recoverCode!);
    // TODO: Send email
  }
}
