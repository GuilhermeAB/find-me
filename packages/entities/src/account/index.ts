import { BaseEntityProps } from '../base/entity.base';
import { AccountProps } from './account.entity';

export interface AccountEntityType extends AccountProps, BaseEntityProps {}

export {
  AccountEntity, CreateAccountProps, AccountStatus, AccountRole,
} from './account.entity';
