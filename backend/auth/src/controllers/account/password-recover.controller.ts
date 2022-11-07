import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountPasswordRecoverService, RANDOM_CODE_LENGTH } from '@find-me/services';

class PasswordRecover {
  private readonly path = '/password-recover';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountPasswordRecoverService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.email, { key: 'EmailRequired' });
    Guard.stringLength(data.email, { min: 6, max: 50 }, { key: 'EmailInvalid' });
    Guard.isString(data.code, { key: 'CodeRequired' });
    Guard.stringLength(data.code, { min: RANDOM_CODE_LENGTH, max: RANDOM_CODE_LENGTH }, { key: 'PasswordRecoverCodeInvalid' });
    Guard.isString(data.password, { key: 'PasswordRequired' });
  }

  private async method({ data }: MethodParams): Promise<MethodResponse> {
    const {
      email,
      code,
      password,
    } = data;

    await this.service.passwordRecover(email, code, password);

    return {
      message: 'PasswordChangeSuccess',
      status: Status.Success,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      validation: PasswordRecover.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const passwordRecover = new PasswordRecover();

export {
  passwordRecover,
};
