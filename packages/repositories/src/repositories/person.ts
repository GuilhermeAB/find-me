import { PersonEntity, PersonEntityType } from '@find-me/entities';
import { PersonModel } from '../dto/schemas/person';
import { Repository } from './base/repository.base';
import { PersonMapper } from './mapper/person.mapper';

export class PersonRepository extends Repository<PersonEntityType, PersonEntity> {
  protected EntityModel = PersonModel;

  protected mapper = new PersonMapper(PersonEntity);
}
