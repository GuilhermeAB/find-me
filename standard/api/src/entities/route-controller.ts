/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Request, RequestHandler, Response, Router,
} from 'express';
import { Status, ValidationError } from '@find-me/errors';

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
  value?: Record<string, unknown>,
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
}

export class RouteController {
  private props: RouteControllerProps;

  constructor(props: RouteControllerProps) {
    this.props = props;
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

        response.status(status).json({
          message,
          value,
        });
      } catch (error) {
        const { status, code, message, params } = RouteController.requestErrorHandler(error as Error);

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

  private static requestErrorHandler(error: Error): MethodErrorResponse {
    if (error instanceof ValidationError) {
      return {
        status: error.status || Status.BadRequest,
        code: error.key,
        message: error.key,
        params: error.params,
      };
    }

    return {
      status: Status.InternalServerError,
      code: 'Internal server error',
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
