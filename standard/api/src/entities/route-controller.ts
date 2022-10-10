/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Request, RequestHandler, Response, Router,
} from 'express';
import { Status, ValidationError } from '@find-me/errors';
import { I18nHandler } from '@find-me/i18n';
import { database } from '@find-me/database';

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
  method: (params: MethodParams) => Promise<MethodResponse>,
  validation?: (params: MethodParams) => void,
  i18nHandler: I18nHandler,
}

interface CreateRouteControllerProps {
  path: string,
  methodType: MethodType,
  method: (params: MethodParams) => Promise<MethodResponse>,
  validation?: (params: MethodParams) => void,
}

export class RouteController {
  private props: RouteControllerProps;

  constructor(props: CreateRouteControllerProps) {
    this.props = {
      ...props,
      i18nHandler: new I18nHandler(),
    };
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

        const { status, message, value } = await this.props.method(params);

        await database.commitTransaction();

        response.status(status).json({
          message,
          value,
        });
      } catch (error) {
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
