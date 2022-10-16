import {
  AccountDetailsEntity,
  AccountEntity, AccountRole, AccountStatus, PersonEntity,
} from '@find-me/entities';
import { AccountProps } from '@find-me/entities/src/account/account.entity';
import { UUID } from '@find-me/uuid';
import { DTOAccountType } from '../../dto/schemas/account';
import { AccountDetailsMapper } from './account-details.mapper';
import { EntityProps, Mapper } from './base/mapper.base';
import { PersonMapper } from './person.mapper';

export class AccountMapper extends Mapper<AccountEntity, DTOAccountType> {
  protected toDomainProps(entity: DTOAccountType): EntityProps<AccountProps> {
    const personMapper = new PersonMapper(PersonEntity);
    const detailsMapper = new AccountDetailsMapper(AccountDetailsEntity);

    return {
      id: entity._id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      props: {
        nickname: entity.nickname,
        email: entity.email,
        password: entity.password,
        role: entity.role as AccountRole,
        status: entity.status as AccountStatus,

        person: typeof entity.person === 'string' ? UUID.generate(entity.person) : personMapper.toDomainEntity(entity.person),
        details: typeof entity.details === 'string' ? UUID.generate(entity.details) : detailsMapper.toDomainEntity(entity.details),
      },
    };
  }
}
