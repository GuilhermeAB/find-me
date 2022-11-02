import { DateVO } from '@find-me/date';
import { AccountDetailsEntity } from '@find-me/entities';
import { AccountDetailsProps } from '@find-me/entities/src/account-details/account-details.entity';
import { DTOAccountDetailsType } from '../../dto/schemas/account-details';
import { EntityProps, Mapper } from './base/mapper.base';

export class AccountDetailsMapper extends Mapper<AccountDetailsEntity, DTOAccountDetailsType> {
  protected toDomainProps(entity: DTOAccountDetailsType): EntityProps<AccountDetailsProps> {
    return {
      id: entity._id,
      props: {
        activationCode: entity.activationCode,
        activationCodeCreatedAt: entity.activationCodeCreatedAt ? new DateVO(entity.activationCodeCreatedAt) : undefined,
        failedActivationAttempts: entity.failedActivationAttempts,
        recoverCode: entity.recoverCode,
        recoverCodeCreatedAt: entity.recoverCodeCreatedAt ? new DateVO(entity.recoverCodeCreatedAt) : undefined,
        failedRecoverAttempts: entity.failedRecoverAttempts,
        lastSignInAt: entity.lastSignInAt ? new DateVO(entity.lastSignInAt) : undefined,
        failedSignInAttempts: entity.failedSignInAttempts,
        lastFailedSignInAttempt: entity.lastFailedSignInAttempt ? new DateVO(entity.lastFailedSignInAttempt) : undefined,
        emailUpdatedAt: entity.emailUpdatedAt ? new DateVO(entity.emailUpdatedAt) : undefined,
        lastFailedPasswordChangeAttempt: entity.lastFailedPasswordChangeAttempt ? new DateVO(entity.lastFailedPasswordChangeAttempt) : undefined,
        failedPasswordChangeAttempts: entity.failedPasswordChangeAttempts,
      },
      timestamps: false,
    };
  }
}
