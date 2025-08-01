import { randomUUID } from 'expo-crypto';
import Model, { ModelInstance } from './model';

type SchemaDefinitionProperty<T> = {

  /** The default value for this path. */
  default?: T | (() => T);

  /** Indicates whether this field should be included in search queries. */
  searchable?: boolean;

  /** The model that `populate()` should use if populating this path. */
  ref?: string;

  /** defines a custom getter for this property. */
  get?: (value: any) => T;

  /** defines a custom setter for this property. */
  set?: (value: any) => any;

  /**
   * Define a transform function for this individual schema type.
   * Only called when calling `toJSON()` or `toObject()`.
   */
  transform?: (val: T) => any;

  /** Function or object describing how to validate this schematype. See [validation docs](https://mongoosejs.com/docs/validation.html). */
  validate?: (val: T) => boolean | ((val: T) => boolean)[];
};

type SchemaDefinition<DocType extends Record<string, any>> = {
  [path in keyof DocType]?: SchemaDefinitionProperty<DocType[path]>;
};

type ToObjectOptions<DocType extends Record<string, any>> = {
  /** apply all getters (path and virtual getters) */
  getters?: boolean;
  /** apply virtual getters (can override getters option) */
  virtuals?: boolean | string[];
  /** if set, mongoose will call this function to allow you to transform the returned object */
  transform?: (
    doc: ModelInstance<DocType>,
    ret: Record<string, any>,
    options: ToObjectOptions<DocType>,
  ) => any;
};

type SchemaOptions<DocType extends Record<string, any>> = {

  /** Exactly the same as the toObject option but only applies when the document's toJSON method is called. */
  toJSON?: ToObjectOptions<DocType>;
  /**
   * Documents have a toObject method which converts the mongoose document into a plain JavaScript object.
   * This method accepts a few options. Instead of applying these options on a per-document basis, we may
   * declare the options at the schema level and have them applied to all of the schema's documents by
   * default.
   */
  toObject?: ToObjectOptions<DocType>;
  /**
   * The timestamps option tells mongoose to assign createdAt and updatedAt fields to your schema. The type
   * assigned is Date. By default, the names of the fields are createdAt and updatedAt. Customize the
   * field names by setting timestamps.createdAt and timestamps.updatedAt.
   */
  timestamps?: boolean;
};

type ModelMiddleware = 'delete' | 'save';

type ModelMiddlewareOptions<Method extends ModelMiddleware> =
  Method extends 'delete'
  ? {}
  : Method extends 'save'
  ? {
    asDraft?: boolean,
  }
  : {};

export default class Schema<DocType extends Record<string, any>> {

  hooks: {
    pre: {
      method: ModelMiddleware,
      fn: (
        this: ModelInstance<DocType>,
        ...args: any
      ) => void | Promise<void>,
    }[];
    post: {
      method: ModelMiddleware,
      fn: (
        this: ModelInstance<DocType>,
        ...args: any
      ) => void | Promise<void>,
    }[];
  };

  paths: SchemaDefinition<DocType>;

  constructor(
    definition: SchemaDefinition<DocType>,
    options?: SchemaOptions<DocType>,
  ) {
    this.hooks = {
      pre: [],
      post: [],
    };
    this.paths = {};

    if (!definition['id']) {
      this.add({
        id: {
          default: () => randomUUID(),
        },
      } as any);
    }

    this.add(definition);

    if (options?.timestamps === true) {
      this.setupTimestamps();
    }
  }

  add(
    obj: SchemaDefinition<DocType>,
  ): this {
    Object.assign(this.paths, obj);
    return this;
  }

  async execPre<T extends Model<DocType>>(
    method: ModelMiddleware,
    model: T,
    args?: any[],
  ): Promise<void> {
    args = args ?? [];

    for (const hook of this.hooks.pre.filter((hook) => hook.method === method)) {
      await hook.fn.call(model as any, ...args);
    }
  }

  async execPost<T extends Model<DocType>>(
    method: ModelMiddleware,
    model: T,
    args?: any[],
  ): Promise<void> {
    args = args ?? [];

    for (const hook of this.hooks.post.filter((hook) => hook.method === method)) {
      await hook.fn.call(model as any, ...args);
    }
  }

  pre<Method extends ModelMiddleware>(
    method: Method,
    fn: (
      this: ModelInstance<DocType>,
      options?: ModelMiddlewareOptions<Method>,
    ) => void | Promise<void>,
  ): this {
    this.hooks.pre.push({
      method: method,
      fn: fn,
    });
    return this;
  }

  post<Method extends ModelMiddleware>(
    method: Method,
    fn: (
      this: ModelInstance<DocType>,
      options?: ModelMiddlewareOptions<Method>,
    ) => void | Promise<void>,
  ): this {
    this.hooks.post.push({
      method: method,
      fn: fn,
    });
    return this;
  }

  setupTimestamps(): void {
    this.add({
      createdAt: {
        default: new Date().toISOString(),
      },
      updatedAt: {
        default: new Date().toISOString(),
      },
    } as any);

    this.pre('save', async function () {
      if (this.isNew) {
        this.set('createdAt', new Date().toISOString() as any);
      }

      this.set('updatedAt', new Date().toISOString() as any);
    });
  }
}
