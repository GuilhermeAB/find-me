import {
  model, Model, Schema, SchemaDefinition, SchemaOptions,
} from 'mongoose';

interface DTOProps<T> {
  name: string,
  schema: Schema,
  entityModel: Model<T>,
}

interface CreateDTO {
  name: string,
  schema: SchemaDefinition,
  schemaOptions?: SchemaOptions,
}

export abstract class DTO<EntityType> {
  private props: DTOProps<EntityType>;

  public get name(): string {
    return this.props.name;
  }

  public get entityModel(): Model<EntityType> {
    return this.props.entityModel;
  }

  constructor(create: CreateDTO) {
    const schema = new Schema(create.schema, {
      ...(create.schemaOptions || {}),
    });

    const entityModel = model<EntityType>(create.name, schema);

    this.props = {
      name: create.name,
      schema,
      entityModel,
    };
  }
}
