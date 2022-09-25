import { PersonEntity, PersonEntityType } from '@find-me/entities';
import { PersonProps } from '@find-me/entities/src/person/person.entity';
import { EntityProps, Mapper } from './base/mapper.base';

export class PersonMapper extends Mapper<PersonEntity, PersonEntityType> {
  protected toDomainProps(entity: PersonEntityType): EntityProps<PersonProps> {
    return {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      props: {
        name: entity.name,
        birthDate: entity.birthDate,
      },
    };
  }
}
