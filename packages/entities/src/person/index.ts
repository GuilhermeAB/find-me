import { BaseEntityProps } from '../base/entity.base';
import { PersonProps } from './person.entity';

export { PersonEntity, CreatePersonProps } from './person.entity';

export interface PersonEntityType extends PersonProps, BaseEntityProps {}
