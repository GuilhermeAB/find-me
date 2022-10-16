import { database } from '@find-me/database';
import { AccountDetailsEntity, AccountEntity, CreateAccountProps } from '@find-me/entities';
import { ValidationError } from '@find-me/errors';
import { AccountDetailsRepository, AccountRepository } from '@find-me/repositories';

export class AccountService {
  private repository: AccountRepository;

  private detailsRepository: AccountDetailsRepository;

  constructor() {
    this.repository = new AccountRepository();
    this.detailsRepository = new AccountDetailsRepository();
  }

  private async isEmailAlreadyInUse(email: string): Promise<boolean> {
    const result = await this.repository.getByEmail(email);

    return !!result;
  }

  public async create(props: CreateAccountProps): Promise<void> {
    const entity = AccountEntity.create(props);
    entity.validate();
    entity.encryptPassword();

    await database.startTransaction();
    const emailAlreadyInUse = await this.isEmailAlreadyInUse(entity.getProps().email);
    if (emailAlreadyInUse) {
      throw new ValidationError({ key: 'EmailAlreadyInUse' });
    }

    // TODO: Send verification email

    await this.detailsRepository.create(entity.getProps().details as AccountDetailsEntity);
    await this.repository.create(entity);
  }
}
