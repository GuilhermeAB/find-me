import {
  Guard, MethodParams, MethodResponse, MethodResponseCookies, MethodType, RouteController,
} from '@find-me/api';
import { Status } from '@find-me/errors';
import { AccountService } from '@find-me/services';

class SignInController {
  private readonly path = '/sign-in';

  private readonly methodType = MethodType.Post;

  private readonly service = new AccountService();

  private static validation({ data }: MethodParams): void {
    if (!data.nickname) {
      Guard.isString(data.email, { key: 'EmailRequired' });
    } else {
      Guard.isString(data.nickname, { key: 'NicknameRequired' });
    }
    Guard.isString(data.password, { key: 'PasswordRequired' });
    Guard.isBoolean(data.keepConnected, { key: 'InvalidParams' }, true);
  }

  private async method({ data }: MethodParams): Promise<MethodResponse> {
    const {
      email,
      nickname,
      password,
      keepConnected,
    } = data;

    const { account, token } = await this.service.signIn(password, email, nickname);

    const info: Record<string, unknown> = {
      account,
    };
    let cookies: MethodResponseCookies;

    if (!keepConnected) {
      info.token = token;
    } else {
      const {
        AUTHENTICATION_SECRET_TOKEN_TIMEOUT_SECONDS,
      } = process.env;

      cookies = {
        authorization: {
          value: token,
          options: {
            maxAge: parseInt(AUTHENTICATION_SECRET_TOKEN_TIMEOUT_SECONDS || '28800', 10) * 1000,
            secure: true,
            sameSite: true,
          },
        },
      };
    }

    return {
      message: 'SignInSuccess',
      status: Status.Success,
      value: info,
      cookies,
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
