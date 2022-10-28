import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountService, TokenBody } from '@find-me/services';

class PasswordChangeController {
  private readonly path = '/password-change';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.password, { key: 'PasswordRequired' });
    Guard.isString(data.currentPassword, { key: 'CurrentPasswordRequired' });
  }

  private async method({ data }: MethodParams, authentication?: TokenBody): Promise<MethodResponse> {
    const {
      password,
      currentPassword,
    } = data;

    const {
      accountId,
    } = authentication!;

    await this.service.passwordChange(accountId, password, currentPassword);

    return {
      message: 'PasswordChangeSuccess',
      status: Status.Success,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      requireAuthentication: true,
      validation: PasswordChangeController.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const passwordChangeController = new PasswordChangeController();

export {
  passwordChangeController,
};
