import { randomUUID } from "expo-crypto";
import { Model } from "./model";

type SchemaDefinitionProperty<T> = {

  /** The default value for this path. */
  default?: T;

  /** Indicates whether this field should be included in search queries. */
  searchable?: boolean;

  /** defines a custom getter for this property. */
  get?: (value: any) => T;

  /** defines a custom setter for this property. */
  set?: (value: any) => any;

  /**
   * Define a transform function for this individual schema type.
   * Only called when calling `toJSON()` or `toObject()`.
   */
  transform?: (val: T) => any;
}

type SchemaDefinition<DocType> = {
  [path in keyof DocType]?: SchemaDefinitionProperty<DocType[path]>;
}

type ToObjectOptions<DocType> = {
  /** apply all getters (path and virtual getters) */
  getters?: boolean;
  /** apply virtual getters (can override getters option) */
  virtuals?: boolean | string[];
  /** if set, mongoose will call this function to allow you to transform the returned object */
  transform?: (
    doc: Model<DocType>,
    ret: Record<string, any>,
    options: ToObjectOptions<DocType>,
  ) => any;
}

type SchemaOptions<DocType> = {

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
}

type ModelMiddleware = 'delete' | 'save'

class Schema<DocType> {

  constructor(
    definition: SchemaDefinition<DocType>,
    options?: SchemaOptions<DocType>,
  ) {
    this.init(definition, options)
  }

  hooks!: {
    pre: {
      method: ModelMiddleware,
      fn: (
        this: Model<DocType>,
      ) => void | Promise<void>,
    }[]
    post: {
      method: ModelMiddleware,
      fn: (
        this: Model<DocType>,
      ) => void | Promise<void>,
    }[]
  }

  paths!: SchemaDefinition<DocType>

  add!: (
    obj: SchemaDefinition<DocType>,
  ) => this

  execPre!: (
    method: ModelMiddleware,
    model: Model<DocType>,
  ) => Promise<void>

  execPost!: (
    method: ModelMiddleware,
    model: Model<DocType>,
  ) => Promise<void>

  init!: (
    definition: SchemaDefinition<DocType>,
    options?: SchemaOptions<DocType>,
  ) => void

  pre!: (
    method: ModelMiddleware,
    fn: (
      this: Model<DocType>,
    ) => void | Promise<void>,
  ) => this

  post!: (
    method: ModelMiddleware,
    fn: (
      this: Model<DocType>,
    ) => void | Promise<void>,
  ) => this

  setupTimestamps!: () => void
}

Schema.prototype.hooks = {
  pre: [],
  post: [],
}

Schema.prototype.init = function (definition, options) {
  this.hooks = {
    pre: [],
    post: [],
  }
  this.paths = definition

  if (!this.paths['id']) {
    this.add({
      id: {
        default: randomUUID(),
      },
    })
  }

  if (options?.timestamps === true) {
    this.setupTimestamps()
  }
}

Schema.prototype.add = function (obj) {
  Object.assign(this.paths, obj)
  return this
}

Schema.prototype.execPre = async function (method, model) {
  for (const hook of this.hooks.pre.filter((hook) => hook.method === method)) {
    await hook.fn.call(model)
  }
}

Schema.prototype.execPost = async function (method, model) {
  for (const hook of this.hooks.post.filter((hook) => hook.method === method)) {
    await hook.fn.call(model)
  }
}

Schema.prototype.pre = function (method, fn) {
  this.hooks.pre.push({
    method: method,
    fn: fn,
  })
  return this
}

Schema.prototype.post = function (method, fn) {
  this.hooks.post.push({
    method: method,
    fn: fn,
  })
  return this
}

Schema.prototype.setupTimestamps = function () {
  this.add({
    createdAt: {
      default: new Date().toISOString(),
    },
    updatedAt: {
      default: new Date().toISOString(),
    },
  })

  this.pre('save', async function () {
    if (this.isNew) {
      this.set('createdAt', new Date().toISOString())
    }

    this.set('updatedAt', new Date().toISOString())
  })
}


export default Schema
