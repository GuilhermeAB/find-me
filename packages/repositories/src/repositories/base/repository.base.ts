import { database } from '@find-me/database';
import { ClientSession, Model } from 'mongoose';

export abstract class Repository<EntityType> {
  private session?: ClientSession;

  protected abstract EntityModel: Model<EntityType>;

  constructor() {
    this.session = database.session;
  }

  public async create(entity: EntityType): Promise<EntityType> {
    const result = new this.EntityModel(entity);
    await result.save({
      session: this.session,
    });

    return result.toObject();
  }

  public async findOneById(id: string): Promise<EntityType | undefined> {
    const result = await this.EntityModel.findOne(
      {
        id,
      },
      undefined,
      {
        session: this.session,
      },
    ).exec();

    return result ? result.toObject() : undefined;
  }

  public async exists(id: string): Promise<boolean> {
    const result = await this.EntityModel.findOne(
      {
        id,
      },
      undefined,
      {
        session: this.session,
      },
    ).exec();

    return !!result;
  }
}
