import { PersonEntityType } from '@find-me/entities';
import { DTO } from '../base/dto.base';

const SCHEMA_NAME = 'Person';

class PersonSchema extends DTO<PersonEntityType> {
  public static create(): PersonSchema {
    const person = new PersonSchema({
      name: SCHEMA_NAME,
      schema: {
        _id: String,
        name: String,
        birthDate: Date,
      },
    });

    return person;
  }
}

const { entityModel: PersonModel, name } = PersonSchema.create();

export {
  PersonModel,
  name,
};
