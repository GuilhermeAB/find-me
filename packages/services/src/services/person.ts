import { database } from '@find-me/database';
import { CreatePersonProps, PersonEntity } from '@find-me/entities/src/person/person.entity';
import { PersonRepository } from '@find-me/repositories';

export class PersonService {
  private repository: PersonRepository;

  constructor() {
    this.repository = new PersonRepository();
  }

  public async create(props: CreatePersonProps): Promise<PersonEntity> {
    const entity = PersonEntity.create(props);
    entity.validate();

    await database.startTransaction();
    return this.repository.create(entity);
  }

  public async findOneById(id: string): Promise<PersonEntity | undefined> {
    await database.startTransaction();
    return this.repository.findOneById(id);
  }
}
