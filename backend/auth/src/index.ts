import {
  ApiServer, RouteController,
} from '@find-me/api';
import {
  activateAccountController,
  activateRequestNewCode,
  passwordChangeController,
  signInController,
  signOutController,
  signUpController,
  passwordRequestRecover,
  passwordRecover,
  personUpdate,
  accountUpdate,
} from './controllers';

export class AuthAPI {
  private static routes(): RouteController[] {
    return [
      signUpController.create(),
      signInController.create(),
      signOutController.create(),
      passwordChangeController.create(),
      activateAccountController.create(),
      activateRequestNewCode.create(),
      passwordRequestRecover.create(),
      passwordRecover.create(),
      personUpdate.create(),
      accountUpdate.create(),
    ];
  }

  public static create(): void {
    const server = new ApiServer({
      prefix: '/auth',
      port: 3000,
      routes: AuthAPI.routes(),
    });

    server.start();
  }
}

AuthAPI.create();
