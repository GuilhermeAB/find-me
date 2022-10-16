import { database } from '@find-me/database';
import { Entity } from '@find-me/entities/src/base/entity.base';
import { Model } from 'mongoose';
import { Mapper } from '../mapper/base/mapper.base';

export abstract class Repository<EntityType, T extends Entity<unknown>> {
  protected abstract mapper: Mapper<T, EntityType>;

  protected abstract EntityModel: Model<EntityType>;

  public async create(entity: T): Promise<T> {
    const result = new this.EntityModel(this.mapper.toDatabaseEntity(entity));
    await result.save({
      session: database.session,
    });

    return this.mapper.toDomainEntity(result.toObject());
  }

  public async findOneById(id: string): Promise<T | undefined> {
    const result = await this.EntityModel.findOne(
      {
        _id: id,
      },
      undefined,
      {
        session: database.session,
      },
    ).exec();

    return result ? this.mapper.toDomainEntity(result.toObject()) : undefined;
  }

  public async exists(id: string): Promise<boolean> {
    const result = await this.EntityModel.findOne(
      {
        _id: id,
      },
      undefined,
      {
        session: database.session,
      },
    ).exec();

    return !!result;
  }
}
