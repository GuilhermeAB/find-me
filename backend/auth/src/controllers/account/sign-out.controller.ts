import {
  MethodParams, MethodResponse, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { Authentication, TokenBody } from '@find-me/services';

class SignOutController {
  private readonly path = '/sign-out';

  private readonly methodType = MethodType.Post;

  // eslint-disable-next-line class-methods-use-this
  private async method(params: MethodParams, authentication?: TokenBody): Promise<MethodResponse> {
    await Authentication.signOut(authentication!);

    return {
      message: 'SignOutSuccess',
      status: Status.Success,
      clearCookies: ['authorization'],
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

const signOutController = new SignOutController();

export {
  signOutController,
};
