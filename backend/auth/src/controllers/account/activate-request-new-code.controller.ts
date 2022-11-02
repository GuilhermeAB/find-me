import {
  MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountService, TokenBody } from '@find-me/services';

class ActivateRequestCode {
  private readonly path = '/account-request-code';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountService();

  private async method(params: MethodParams, authentication?: TokenBody): Promise<MethodResponse> {
    const {
      accountId,
    } = authentication!;

    await this.service.activateRequestNewCode(accountId);

    return {
      message: 'ActivationCodeSent',
      status: Status.Success,
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      requireAuthentication: true,
      method: this.method.bind(this),
    });
  }
}

const activateRequestNewCode = new ActivateRequestCode();

export {
  activateRequestNewCode,
};
