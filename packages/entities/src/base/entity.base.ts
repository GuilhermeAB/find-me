import { UUID } from '@find-me/uuid';
import { DateVO } from '@find-me/date';

export interface BaseEntityProps {
  id: UUID,
  createdAt?: DateVO,
  updatedAt?: DateVO,
}

export interface CreateEntityProps<T> {
  id?: UUID | string,
  props: T,
  createdAt?: DateVO | Date,
  updatedAt?: DateVO | Date,
  timestamps?: boolean,
}

export abstract class Entity<EntityProps> {
  private readonly id: UUID;

  private readonly createdAt?: DateVO;

  private updatedAt?: DateVO;

  protected readonly props: EntityProps;

  constructor({
    id, createdAt, updatedAt, props, timestamps = true,
  }: CreateEntityProps<EntityProps>) {
    const now = DateVO.now();

    this.id = UUID.generate(id);
    if (timestamps) {
      this.createdAt = new DateVO(createdAt || now);
      this.updatedAt = new DateVO(updatedAt || now);
    }
    this.props = props;
  }

  public abstract validate(): void;

  public getProps(): EntityProps & BaseEntityProps {
    const copyProps = {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      ...this.props,
    };

    return Object.freeze(copyProps);
  }

  public getFlatProps(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      id: this.id.value,
    };

    if (this.createdAt && this.updatedAt) {
      result.createdAt = this.createdAt.value;
      result.updatedAt = this.updatedAt.value;
    }

    Object.entries((this.props)).forEach(([key, value]) => {
      if (value instanceof UUID) {
        result[key] = value.value;
      } else if (value instanceof DateVO) {
        result[key] = value.value;
      } else if (value instanceof Entity) {
        result[key] = (value as Entity<unknown>).getFlatProps();
      } else {
        result[key] = value;
      }
    });

    return Object.freeze(result);
  }
}
