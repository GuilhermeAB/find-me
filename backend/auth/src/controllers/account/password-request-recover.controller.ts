import {
  Guard,
  MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountService } from '@find-me/services';

class PasswordRequestRecover {
  private readonly path = '/password-recover';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.email, { key: 'EmailRequired' });
    Guard.stringLength(data.email, { min: 6, max: 50 }, { key: 'EmailInvalid' });
  }

  private async method({ data }: MethodParams): Promise<MethodResponse> {
    const {
      email,
    } = data;

    await this.service.passwordRequestRecoverCode(email);

    return {
      message: 'PasswordRecoverSent',
      status: Status.Success,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      validation: PasswordRequestRecover.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const passwordRequestRecover = new PasswordRequestRecover();

export {
  passwordRequestRecover,
};
