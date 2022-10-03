/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  Request, RequestHandler, Response, Router,
} from 'express';

export enum MethodType {
  Post = 'post',
  Put = 'put',
  Get = 'get',
  Patch = 'patch',
  Delete = 'delete',
}

export enum MethodStatus {
  Success = 200,
  Unauthorized = 403,
  NotFound = 404,
  InternalServerError = 500,
}

export interface MethodParams {
  params: Record<string, string>,
  data: Record<string, string>,
}

export interface MethodResponse {
  status: MethodStatus,
  message: string,
  value?: Record<string, unknown>,
}

interface RouteControllerProps {
  path: string,
  methodType: MethodType,
  method: (methodParams: MethodParams) => Promise<MethodResponse>,
}

export class RouteController {
  private props: RouteControllerProps;

  constructor(props: RouteControllerProps) {
    this.props = props;
  }

  private requestHandler(): RequestHandler {
    return async (request: Request, response: Response): Promise<void> => {
      const { status, message, value } = await this.props.method({
        params: request.params,
        data: {
          ...request.body as Record<string, string>,
          ...request.query,
        } as Record<string, string>,
      });

      response.status(status).json({
        message,
        value,
      });
    };
  }

  public async handler(router: Router): Promise<void> {
    const {
      methodType,
      path,
    } = this.props;

    switch (methodType) {
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
        router.get(path, this.requestHandler());
        break;
    }
  }
}
