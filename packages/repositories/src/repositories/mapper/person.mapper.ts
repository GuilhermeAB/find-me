import { DateVO } from '@find-me/date';
import { PersonEntity } from '@find-me/entities';
import { PersonProps } from '@find-me/entities/src/person/person.entity';
import { DTOPersonType } from '../../dto/schemas/person';
import { EntityProps, Mapper } from './base/mapper.base';

export class PersonMapper extends Mapper<PersonEntity, DTOPersonType> {
  protected toDomainProps(entity: DTOPersonType): EntityProps<PersonProps> {
    return {
      id: entity._id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      props: {
        name: entity.name,
        birthDate: new DateVO(entity.birthDate),
      },
    };
  }
}
