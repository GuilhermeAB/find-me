import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountService, RANDOM_CODE_LENGTH, TokenBody } from '@find-me/services';

class ActivateController {
  private readonly path = '/account-activate';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.code, { key: 'CodeRequired' });
    Guard.stringLength(data.code, { min: RANDOM_CODE_LENGTH, max: RANDOM_CODE_LENGTH }, { key: 'ActivationCodeInvalid' });
  }

  private async method({ data }: MethodParams, authentication?: TokenBody): Promise<MethodResponse> {
    const {
      code,
    } = data;

    const {
      accountId,
    } = authentication!;

    await this.service.activate(accountId, code);

    return {
      message: 'ActivationSuccess',
      status: Status.Success,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      requireAuthentication: true,
      validation: ActivateController.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const activateAccountController = new ActivateController();

export {
  activateAccountController,
};
