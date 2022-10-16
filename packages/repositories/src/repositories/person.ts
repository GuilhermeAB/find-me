import { PersonEntity } from '@find-me/entities';
import { DTOPersonType, PersonModel } from '../dto/schemas/person';
import { Repository } from './base/repository.base';
import { PersonMapper } from './mapper/person.mapper';

export class PersonRepository extends Repository<DTOPersonType, PersonEntity> {
  protected EntityModel = PersonModel;

  protected mapper = new PersonMapper(PersonEntity);
}
