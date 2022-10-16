import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountService } from '@find-me/services';

class SignInController {
  private readonly path = '/sign-in';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.email, { key: 'EmailRequired' });
    Guard.isString(data.password, { key: 'PasswordRequired' });
  }

  private async method({ data }: MethodParams): Promise<MethodResponse> {
    const {
      email,
      password,
    } = data;

    const account = await this.service.signIn(email, password);

    return {
      message: 'SignInSuccess',
      status: Status.Success,
      value: account,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      validation: SignInController.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const signInController = new SignInController();

export {
  signInController,
};
