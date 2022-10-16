import { AccountEntity, AccountEntityType } from '@find-me/entities';
import { AccountProps } from '@find-me/entities/src/account/account.entity';
import { EntityProps, Mapper } from './base/mapper.base';

export class AccountMapper extends Mapper<AccountEntity, AccountEntityType> {
  protected toDomainProps(entity: AccountEntityType): EntityProps<AccountProps> {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      props: {
        nickname: entity.nickname,
        email: entity.email,
        password: entity.password,
        role: entity.role,
        status: entity.status,

        person: entity.person,
        details: entity.details,
      },
    };
  }
}
