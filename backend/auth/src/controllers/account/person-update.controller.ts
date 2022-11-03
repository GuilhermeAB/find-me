import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { DateVO } from '@find-me/date';
import { Status } from '@find-me/errors';
import { PersonService, TokenBody } from '@find-me/services';

class PersonUpdateController {
  private readonly path = '/person-update';

  private readonly methodType = MethodType.Patch;

  private readonly personService = new PersonService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.name, { key: 'InvalidName' }, true);
    Guard.isDate(data.birthDate, true);
  }

  private async method({ data }: MethodParams, authentication?: TokenBody): Promise<MethodResponse> {
    const {
      name,
      birthDate,
    } = data;

    const {
      personId,
    } = authentication!;

    const person = await this.personService.update(personId, name, DateVO.generate(birthDate));

    return {
      message: 'Updated',
      status: Status.Success,
      value: {
        person,
      },
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      requireAuthentication: true,
      validation: PersonUpdateController.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const personUpdate = new PersonUpdateController();

export {
  personUpdate,
};
