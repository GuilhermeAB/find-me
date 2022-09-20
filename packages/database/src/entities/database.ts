import { Connection, connect, ClientSession } from 'mongoose';

const options = {
  autoIndex: true,
};

interface DatabaseProps {
  uri: string,
  connection?: Connection,
  client?: ClientSession,
}

export class Database {
  private props: DatabaseProps;

  private get uri(): string {
    return this.props.uri;
  }

  private get connection(): Connection | undefined {
    return this.props.connection;
  }

  private set connection(connection: Connection | undefined) {
    this.props.connection = connection;
  }

  public get session(): ClientSession | undefined {
    return this.session;
  }

  private set session(session: ClientSession | undefined) {
    this.props.client = session;
  }

  constructor(props: DatabaseProps) {
    this.props = props;
  }

  private async connectIntoDatabase(): Promise<void> {
    const { connection } = await connect(this.uri, options);

    this.connection = connection;
  }

  public async startTransaction(): Promise<void> {
    await this.connectIntoDatabase();

    this.session = await this.connection?.startSession();
    this.session?.startTransaction();
  }

  public async commitTransaction(): Promise<void> {
    await this.session?.commitTransaction();
  }

  public async abortTransaction(): Promise<void> {
    await this.session?.abortTransaction();
  }
}
