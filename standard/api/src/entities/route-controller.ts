/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Request, RequestHandler, Response, Router,
} from 'express';
import { Status, ValidationError } from '@find-me/errors';
import { I18nHandler } from '@find-me/i18n';
import { database } from '@find-me/database';
import { TokenBody, Authentication } from '@find-me/services';

export enum MethodType {
  Post = 'post',
  Put = 'put',
  Get = 'get',
  Patch = 'patch',
  Delete = 'delete',
}

export interface MethodParams {
  params: Record<string, string>,
  data: Record<string, string>,
}

export interface MethodResponse {
  status: Status,
  message: string,
  value?: unknown,
}

interface MethodErrorResponse {
  status: Status,
  code: string,
  message: string,
  params?: Record<string, unknown>,
}

interface RouteControllerProps {
  path: string,
  methodType: MethodType,
  method: (params: MethodParams, authentication?: TokenBody) => Promise<MethodResponse>,
  validation?: (params: MethodParams) => void,
  i18nHandler: I18nHandler,
  authentication?: TokenBody,
  requireAuthentication?: boolean,
}

interface CreateRouteControllerProps {
  path: string,
  methodType: MethodType,
  method: (params: MethodParams, authentication?: TokenBody) => Promise<MethodResponse>,
  validation?: (params: MethodParams) => void,
  requireAuthentication?: boolean,
}

export class RouteController {
  private props: RouteControllerProps;

  constructor(props: CreateRouteControllerProps) {
    this.props = {
      ...props,
      i18nHandler: new I18nHandler(),
    };
  }

  private async validateAuthentication(value?: string): Promise<void> {
    if (!value) {
      throw new ValidationError({ key: 'SignInRequired' });
    }
    const token = Authentication.parseToken(value);
    const isValid = await Authentication.validateToken(token);
    if (!isValid) {
      throw new ValidationError({ key: 'SignInRequired' });
    }

    this.props.authentication = token;
  }

  private requestHandler(): RequestHandler {
    return async (request: Request, response: Response): Promise<void> => {
      try {
        const params = {
          params: request.params,
          data: {
            ...request.body as Record<string, string>,
            ...request.query,
          } as Record<string, string>,
        };

        if (this.props.validation) {
          this.props.validation(params);
        }

        if (this.props.requireAuthentication) {
          const token = request.headers.authorization;
          await this.validateAuthentication(token);
        }

        const { status, message, value } = await this.props.method(params, this.props.authentication);

        await database.commitTransaction();

        response.status(status).json({
          message,
          value,
        });
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.log((error as Error).message);
        }

        await database.abortTransaction();

        const {
          status, code, message, params,
        } = this.requestErrorHandler(error as Error);

        response.status(status).json({
          error: {
            code,
            message,
            params,
          },
        });
      }
    };
  }

  private requestErrorHandler(error: Error): MethodErrorResponse {
    if (error instanceof ValidationError) {
      const { code, message, params } = this.props.i18nHandler.getMessage(error.key, error.params);

      return {
        status: error.status || Status.BadRequest,
        code,
        message,
        params,
      };
    }

    return {
      status: Status.InternalServerError,
      code: 'InternalServerError',
      message: 'Internal server error',
    };
  }

  public async handler(router: Router): Promise<void> {
    const {
      methodType,
      path,
    } = this.props;

    switch (methodType) {
      case MethodType.Get:
        router.get(path, this.requestHandler());
        break;
      case MethodType.Post:
        router.post(path, this.requestHandler());
        break;
      case MethodType.Put:
        router.put(path, this.requestHandler());
        break;
      case MethodType.Patch:
        router.patch(path, this.requestHandler());
        break;
      case MethodType.Delete:
        router.delete(path, this.requestHandler());
        break;
      default:
        throw new Error(`Not supported method type: ${String(methodType)}`);
    }
  }
}
