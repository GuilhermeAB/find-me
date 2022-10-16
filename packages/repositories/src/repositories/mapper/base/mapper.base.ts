/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateVO } from '@find-me/date';
import { CreateEntityProps, Entity } from '@find-me/entities/src/base/entity.base';
import { UUID } from '@find-me/uuid';

export interface EntityProps<T> {
  id: UUID | string,
  props: T,
  createdAt?: DateVO | Date,
  updatedAt?: DateVO | Date,
  timestamps?: boolean,
}

export abstract class Mapper<T extends Entity<unknown>, DTOEntityType> {
  constructor(
    private EntityConstructor: new (props: CreateEntityProps<any>) => T,
  ) {}

  protected abstract toDomainProps(databaseEntity: DTOEntityType): EntityProps<unknown>;

  public toDomainEntity(entity: DTOEntityType & { _id: string }): T {
    const {
      props,
      createdAt,
      updatedAt,
      timestamps,
    } = this.toDomainProps(entity);

    return new this.EntityConstructor({
      id: entity._id,
      props,
      createdAt,
      updatedAt,
      timestamps,
    });
  }

  public toDomainEntities(entities: Array<DTOEntityType & { _id: string }>): T[] {
    return entities.map((entity) => this.toDomainEntity(entity));
  }

  public toDatabaseEntity(entity: T): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    Object.entries(entity.getProps()).forEach(([key, value]) => {
      if (value instanceof UUID) {
        result._id = value.value;
      } else if (value instanceof DateVO) {
        result[key] = value.value;
      } else if (value instanceof Entity) {
        result[key] = (value as Entity<unknown>).getProps().id.value;
      } else {
        result[key] = value;
      }
    });

    return result;
  }
}
