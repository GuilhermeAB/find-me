import { BaseEntityProps } from '../base/entity.base';
import { AccountDetailsProps } from './account-details.entity';

export interface AccountDetailsEntityType extends AccountDetailsProps, BaseEntityProps {}

export { AccountDetailsEntity, RANDOM_CODE_LENGTH } from './account-details.entity';
