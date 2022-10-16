import { ValidationError } from '@find-me/errors';
import { config } from 'dotenv';
import { Database } from '../entities/database';

interface DatabaseHandlerProps {
  database: Database,
}

export class DatabaseHandler {
  private props: DatabaseHandlerProps;

  public get database(): Database {
    return this.props.database;
  }

  constructor(database: Database) {
    this.props = {
      database,
    };
  }

  public static create(): DatabaseHandler {
    config();

    const {
      DATABASE_URI,
    } = process.env;

    if (!DATABASE_URI) {
      throw new ValidationError({ key: 'InvalidEnv' });
    }

    const database = new Database({ uri: DATABASE_URI });
    const handler = new DatabaseHandler(database);

    return handler;
  }
}

export const { database } = DatabaseHandler.create();
