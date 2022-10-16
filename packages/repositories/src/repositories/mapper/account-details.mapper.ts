import { AccountDetailsEntity, AccountDetailsEntityType } from '@find-me/entities';
import { AccountDetailsProps } from '@find-me/entities/src/account-details/account-details.entity';
import { EntityProps, Mapper } from './base/mapper.base';

export class AccountDetailsMapper extends Mapper<AccountDetailsEntity, AccountDetailsEntityType> {
  protected toDomainProps(entity: AccountDetailsEntityType): EntityProps<AccountDetailsProps> {
    return {
      id: entity.id,
      props: {
        activationCode: entity.activationCode,
        activationCodeCreatedAt: entity.activationCodeCreatedAt,
        failedActivationAttempts: entity.failedActivationAttempts,
        recoverCode: entity.recoverCode,
        recoverCodeCreatedAt: entity.recoverCodeCreatedAt,
        failedRecoverAttempts: entity.failedRecoverAttempts,
        lastSignInAt: entity.lastSignInAt,
        failedSignInAttempts: entity.failedSignInAttempts,
        lastFailedSignInAttempt: entity.lastFailedSignInAttempt,
        emailUpdatedAt: entity.emailUpdatedAt,
      },
    };
  }
}
