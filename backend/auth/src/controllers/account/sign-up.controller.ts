import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { DateVO } from '@find-me/date';
import { Status } from '@find-me/errors';
import { AccountService, PersonService } from '@find-me/services';

class SignUpController {
  private readonly path = '/sign-up';

  private readonly methodType = MethodType.Post;

  private readonly accountService = new AccountService();

  private readonly personService = new PersonService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.nickname, { key: 'NickNameRequired' });
    Guard.isString(data.email, { key: 'EmailRequired' });
    Guard.isString(data.password, { key: 'PasswordRequired' });
    Guard.isString(data.name, { key: 'NameRequired' });
    Guard.isString(data.birthDate, { key: 'BirthDateRequired' });
  }

  private async method({ data }: MethodParams): Promise<MethodResponse> {
    const {
      name,
      birthDate,
      nickname,
      email,
      password,
    } = data;

    const person = await this.personService.create({
      name,
      birthDate: DateVO.generate(birthDate),
    });

    await this.accountService.create({
      nickname,
      email,
      password,
      person,
    });

    return {
      message: 'SignUpSuccess',
      status: Status.Success,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      validation: SignUpController.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const signUpController = new SignUpController();

export {
  signUpController,
};
