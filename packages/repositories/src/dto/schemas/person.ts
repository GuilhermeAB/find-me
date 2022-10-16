import { DTO } from '../base/dto.base';

const SCHEMA_NAME = 'Person';

export interface DTOPersonType {
  _id: string,
  name: string,
  birthDate: Date,
  createdAt: Date,
  updatedAt: Date,
}

class PersonSchema extends DTO<DTOPersonType> {
  public static create(): PersonSchema {
    const person = new PersonSchema({
      name: SCHEMA_NAME,
      schema: {
        _id: String,
        name: String,
        birthDate: Date,
      },
      options: {
        timestamps: true,
      },
    });

    return person;
  }
}

const { entityModel: PersonModel, name: personSchemaName } = PersonSchema.create();

export {
  PersonModel,
  personSchemaName,
};
