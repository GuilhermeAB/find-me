import {
  ApiServer, RouteController,
} from '@find-me/api';
import { signInController, signUpController } from './controllers';

export class AuthAPI {
  private static routes(): RouteController[] {
    return [
      signUpController.create(),
      signInController.create(),
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
