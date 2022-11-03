import { Server } from 'http';
import express, {
  Application, json, Request, Router,
} from 'express';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import cookieParser from 'cookie-parser';
import { RouteController } from './route-controller';

const DEFAULT_SERVER_PORT = 3000;

interface ApiServerProps {
  application: Application,
  server?: Server,
  router: Router,
  port: number,
  prefix: string,
  routes: RouteController[],
}

interface CreateApiServerProps {
  port?: number,
  prefix: string,
  routes: RouteController[],
}

export class ApiServer {
  private props: ApiServerProps;

  constructor(create: CreateApiServerProps) {
    config();

    this.props = {
      port: create.port || DEFAULT_SERVER_PORT,
      application: express(),
      router: Router(),
      prefix: create.prefix,
      routes: create.routes,
    };

    this.globalMiddlewares();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.props.routes.map((route) => route.handler(this.props.router));
    this.props.application.use(this.props.prefix, this.props.router);
  }

  private globalMiddlewares(): void {
    const {
      AUTHENTICATION_COOKIE_SECRET,
    } = process.env;

    this.props.application.use(compression());
    this.props.application.use(helmet());
    this.props.application.use(json());
    this.props.application.use(cookieParser(AUTHENTICATION_COOKIE_SECRET));

    this.requestLogger();
  }

  private requestLogger(): void {
    morgan.token('local-date', () => {
      const date = new Date();
      return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    });
    morgan.token('params', (request: Request) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { body } = request;

      return `body-> ${JSON.stringify(body || {})}`;
    });

    this.props.application.use(morgan('[:status - :local-date] :method :url :params - :response-time ms'));
  }

  public start(): void {
    const {
      port,
    } = this.props;

    this.props.application.listen(port);
  }
}
