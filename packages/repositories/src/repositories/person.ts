import { PersonEntityType } from '@find-me/entities';
import { PersonModel } from '../dto/schemas/person';
import { Repository } from './base/repository.base';

export class PersonRepository extends Repository<PersonEntityType> {
  protected EntityModel = PersonModel;
}
