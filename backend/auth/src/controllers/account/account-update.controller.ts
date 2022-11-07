import {
  Guard, MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status, ValidationError } from '@find-me/errors';
import { AccountUpdateService, TokenBody } from '@find-me/services';

class AccountUpdateController {
  private readonly path = '/account-update';

  private readonly methodType = MethodType.Patch;

  private readonly service = new AccountUpdateService();

  private static validation({ data }: MethodParams): void {
    Guard.isString(data.email, { key: 'EmailInvalid' }, true);
    Guard.isString(data.nickname, { key: 'InvalidNickname' }, true);

    if (!data.email && !data.nickname) {
      throw new ValidationError({ key: 'InvalidParams' });
    }
  }

  private async method({ data }: MethodParams, authentication?: TokenBody): Promise<MethodResponse> {
    const {
      email,
      nickname,
    } = data;

    const {
      accountId,
    } = authentication!;

    const account = await this.service.update(accountId, nickname, email);

    return {
      message: 'Updated',
      status: Status.Success,
      value: {
        account,
      },
    };
  }

  public create(): RouteController {
    return new RouteController({
      path: this.path,
      methodType: this.methodType,
      requireAuthentication: true,
      validation: AccountUpdateController.validation.bind(this),
      method: this.method.bind(this),
    });
  }
}

const accountUpdate = new AccountUpdateController();

export {
  accountUpdate,
};
