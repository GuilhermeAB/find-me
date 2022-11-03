import { PersonEntity } from '@find-me/entities';
import { database } from '@find-me/database';
import { DTOPersonType, PersonModel } from '../dto/schemas/person';
import { Repository } from './base/repository.base';
import { PersonMapper } from './mapper/person.mapper';

export class PersonRepository extends Repository<DTOPersonType, PersonEntity> {
  protected EntityModel = PersonModel;

  protected mapper = new PersonMapper(PersonEntity);

  public async update(person: PersonEntity): Promise<PersonEntity> {
    const {
      id,
      name,
      birthDate,
    } = person.getProps();

    const result = await this.EntityModel.findOneAndUpdate(
      {
        _id: id.value,
      },
      {
        $set: {
          name,
          birthDate: birthDate.value,
        },
      },
      {
        session: database.session,
        new: true,
      },
    ).exec();

    return this.mapper.toDomainEntity(result!.toObject());
  }
}
