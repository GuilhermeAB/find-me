import { CreatePersonProps, PersonEntity } from '@find-me/entities';
import { database } from '@find-me/database';
import { PersonService } from '../index';

export class PersonCreateService extends PersonService {
  public async create(props: CreatePersonProps): Promise<PersonEntity> {
    const entity = PersonEntity.create(props);
    entity.validate();

    await database.startTransaction();
    return this.repository.create(entity);
  }
}
