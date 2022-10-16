import { database } from '@find-me/database';
import { AccountDetailsEntity, AccountEntity, CreateAccountProps } from '@find-me/entities';
import { AccountDetailsRepository, AccountRepository } from '@find-me/repositories';

export class AccountService {
  private repository: AccountRepository;

  constructor() {
    this.repository = new AccountRepository();
  }

  public async create(props: CreateAccountProps): Promise<AccountEntity> {
    const entity = AccountEntity.create(props);
    entity.validate();
    entity.encryptPassword();
    const detailsRepository = new AccountDetailsRepository();

    await database.startTransaction();
    await detailsRepository.create(entity.getProps().details as AccountDetailsEntity);
    return this.repository.create(entity);
  }
}
