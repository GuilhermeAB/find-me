import { AccountStatus } from '@find-me/entities';
import { AccountDetailsRepository, AccountRepository } from '@find-me/repositories';

export class AccountService {
  protected repository: AccountRepository;

  protected detailsRepository: AccountDetailsRepository;

  constructor() {
    this.repository = new AccountRepository();
    this.detailsRepository = new AccountDetailsRepository();
  }

  protected async isEmailAlreadyInUse(email: string): Promise<boolean> {
    const result = await this.repository.findByEmail(email);

    return !!result;
  }

  protected async isNicknameAlreadyInUse(nickname: string): Promise<boolean> {
    const result = await this.repository.findByNickname(nickname);

    return !!result;
  }

  protected static accountIsDisabled(status: AccountStatus): boolean {
    return status === AccountStatus.disabled;
  }

  protected static accountIsVerified(status: AccountStatus): boolean {
    return status === AccountStatus.verified;
  }

  protected static accountIsUnverified(status: AccountStatus): boolean {
    return status === AccountStatus.unverified;
  }
}
