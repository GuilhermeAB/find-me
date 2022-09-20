import { UUID } from '@find-me/uuid';
import { DateVO } from '@find-me/date';

export interface BaseEntityProps {
  id: UUID,
  createdAt: DateVO,
  updatedAt: DateVO,
}

export interface CreateEntityProps<T> {
  id?: UUID | string,
  props: T,
  createdAt?: DateVO | Date,
  updatedAt?: DateVO | Date,
}

export abstract class Entity<EntityProps> {
  private readonly id: UUID;

  private readonly createdAt: DateVO;

  private updatedAt: DateVO;

  protected readonly props: EntityProps;

  constructor({
    id, createdAt, updatedAt, props,
  }: CreateEntityProps<EntityProps>) {
    const now = DateVO.now();

    this.id = UUID.generate(id);
    this.createdAt = new DateVO(createdAt || now);
    this.updatedAt = new DateVO(updatedAt || now);
    this.props = props;

    this.validate();
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
}