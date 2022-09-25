/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateVO } from '@find-me/date';
import { CreateEntityProps, Entity } from '@find-me/entities/src/base/entity.base';
import { UUID } from '@find-me/uuid';

export interface EntityProps<T> {
  id: UUID | string,
  props: T,
  createdAt: DateVO | Date,
  updatedAt: DateVO | Date,
}

export abstract class Mapper<T extends Entity<unknown>, EntityType> {
  constructor(
    private EntityConstructor: new (props: CreateEntityProps<any>) => T,
  ) {}

  protected abstract toDomainProps(databaseEntity: EntityType): EntityProps<unknown>;

  public toDomainEntity(entity: EntityType): T {
    const {
      id,
      props,
      createdAt,
      updatedAt,
    } = this.toDomainProps(entity);

    return new this.EntityConstructor({
      id,
      props,
      createdAt,
      updatedAt,
    });
  }

  public toDomainEntities(entities: EntityType[]): T[] {
    return entities.map((entity) => this.toDomainEntity(entity));
  }
}
