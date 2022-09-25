import { database } from '@find-me/database';
import { Entity } from '@find-me/entities/src/base/entity.base';
import { ClientSession, Model } from 'mongoose';
import { Mapper } from '../mapper/base/mapper.base';

export abstract class Repository<EntityType, T extends Entity<unknown>> {
  private readonly session?: ClientSession;

  protected abstract mapper: Mapper<T, EntityType>;

  protected abstract EntityModel: Model<EntityType>;

  constructor() {
    this.session = database.session;
  }

  public async create(entity: T): Promise<T> {
    const result = new this.EntityModel(entity.getProps());
    await result.save({
      session: this.session,
    });

    return this.mapper.toDomainEntity(result.toObject());
  }

  public async findOneById(id: string): Promise<T | undefined> {
    const result = await this.EntityModel.findOne(
      {
        id,
      },
      undefined,
      {
        session: this.session,
      },
    ).exec();

    return result ? this.mapper.toDomainEntity(result.toObject()) : undefined;
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
