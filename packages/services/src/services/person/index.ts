import { PersonRepository } from '@find-me/repositories';

export class PersonService {
  protected repository: PersonRepository;

  constructor() {
    this.repository = new PersonRepository();
  }
}
