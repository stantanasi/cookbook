import AsyncStorage from '@react-native-async-storage/async-storage'
import { Buffer } from 'buffer'
import Octokit from "../octokit/octokit"
import Database, { database } from "./database"
import { DATABASE_BRANCH } from './environment'
import { ModelValidationError } from './error'
import Query, { FilterQuery } from './query'
import Schema from "./schema"
import { Types } from './types'

const models: {
  [name: string]: ModelConstructor<any>,
} = {}


export type ModelConstructor<DocType> = {

  new(
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      isDraft?: boolean,
    },
  ): ModelInstance<DocType>


  _docs: DocType[]

  /** The name of the collection the model is associated with. */
  collection: string

  /** Creates a `count` query: gets the count of documents that match `filter`. */
  count(
    filter?: FilterQuery<DocType>,
  ): Query<number, DocType>

  /** Connection the model uses. */
  db: Database

  /** Fetches all documents from the collection. */
  fetch(): Promise<ModelInstance<DocType>[]>

  /** Creates a `find` query: gets a list of documents that match `filter`. */
  find(
    filter?: FilterQuery<DocType>,
  ): Query<ModelInstance<DocType>[], DocType>

  /** Finds a single document by its id. */
  findById(id: Types.ObjectId | any): Query<ModelInstance<DocType> | null, DocType>

  register(name: string): void

  /** Schema the model uses. */
  schema: Schema<DocType>

  /** Searches for documents that match the provided query string. */
  search(
    query: string,
    filter?: FilterQuery<DocType>,
  ): Query<ModelInstance<DocType>[], DocType>

  prototype: ModelInstance<DocType>
}

class ModelClass<DocType> {

  /** This documents id. */
  id!: Types.ObjectId

  _doc!: DocType
  _modifiedPath!: (keyof DocType)[]

  constructor(
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      isDraft?: boolean,
    },
  ) {
    this.init(obj, options);
  }

  /** Assigns values to the document. */
  assign!: (obj: Partial<DocType>) => this

  /** Removes this document from the db. */
  delete!: () => Promise<void>

  /** Returns the value of a path. */
  get!: <T extends keyof DocType>(
    path: T,
    options?: {
      getter?: boolean,
    },
  ) => DocType[T]

  init!: (
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      isDraft?: boolean,
    },
  ) => void

  /**
   * Returns true if any of the given paths are modified, else false. If no arguments, returns `true` if any path
   * in this document is modified.
   */
  isModified!: <T extends keyof DocType>(path?: T) => boolean

  /** Boolean flag specifying if the ModelFunction is new. */
  isNew!: boolean

  /** Boolean flag specifying if the ModelFunction is a draft. */
  isDraft!: boolean

  /** Marks the path as having pending changes to write to the db. */
  markModified!: <T extends keyof DocType>(path: T) => void

  model!: () => ModelConstructor<DocType>

  /** Populates document references. */
  populate!: <Paths = {}>(
    path: keyof DocType,
  ) => Promise<this & Paths>

  /** Saves this Document in the db by inserting a new Document into the database if Model.isNew is `true`, or update if `isNew` is `false`. */
  save!: (
    options?: {
      asDraft?: boolean,
    },
  ) => Promise<this>

  /** The document's schema. */
  schema!: Schema<DocType>

  /** Sets the value of a path */
  set!: <T extends keyof DocType>(
    path: T,
    val: DocType[T],
    options?: {
      setter?: boolean,
      skipMarkModified?: boolean,
    },
  ) => this

  /** The return value of this method is used in calls to JSON.stringify(doc). */
  toJSON!: () => DocType

  /** Converts this ModelFunction into a plain-old JavaScript object ([POJO](https://masteringjs.io/tutorials/fundamentals/pojo)). */
  toObject!: () => DocType

  /** Clears the modified state on the specified path. */
  unmarkModified!: <T extends keyof DocType>(path: T) => void

  /** Executes registered validation rules for this document. */
  validate!: (
    options?: {
      pathsToSkip?: (keyof DocType)[],
    },
  ) => ModelValidationError<DocType> | null
}

export type ModelInstance<DocType> = ModelClass<DocType> & DocType

const BaseModel = ModelClass as ModelConstructor<Record<string, any>>


BaseModel._docs = []

BaseModel.count = function (filter) {
  const mq = new Query(this)

  return mq.count(filter)
}

BaseModel.fetch = async function () {
  let docs: ModelInstance<any>[] = []
  if (this._docs.length > 0) {
    docs = this._docs.map((doc) => new this(doc, {
      isNew: false,
    }))
  } else {
    const octokit = new Octokit({
      auth: this.db.token,
    })
    const branch = await octokit.branches.getBranch('stantanasi', 'cookbook', DATABASE_BRANCH)

    docs = await fetch(`https://raw.githubusercontent.com/stantanasi/cookbook/${branch.commit.sha}/${this.collection}.json`)
      .then((res) => res.json())
      .then((data: any[]) => {
        this._docs = data
        return this._docs.map((doc) => new this(doc, {
          isNew: false,
        }))
      })
  }

  const drafts = await AsyncStorage.getItem(`${this.collection}_drafts`)
    .then((value) => {
      if (value) return JSON.parse(value) as any[]
      else return []
    })
    .then((drafts) => drafts.map((draft) => new this(draft, {
      isNew: !docs.some((doc) => doc.id.toString() === draft.id.toString()),
      isDraft: true,
    })))
    .then((drafts) => drafts.map((draft) => {
      const saved = docs.find((doc) => doc.id.toString() === draft.id.toString())

      Object.keys(this.schema.paths)
        .filter((path) => {
          if (saved) {
            return saved.get(path) !== draft.get(path)
          } else {
            const defaultFunction = this.schema.paths[path]?.default
            const defaultValue = typeof defaultFunction === 'function'
              ? defaultFunction()
              : defaultFunction

            return defaultValue !== draft.get(path)
          }
        })
        .forEach((path) => draft.markModified(path))

      return draft
    }))

  return [
    ...drafts,
    ...docs,
  ]
}

BaseModel.find = function (filter) {
  const mq = new Query(this)

  return mq.find(filter)
}

BaseModel.findById = function (id) {
  const mq = new Query(this)

  return mq.findById(id)
}

BaseModel.register = function (name) {
  models[name] = this

  this.prototype.model = () => {
    return this
  }
}

BaseModel.search = function (query, filter) {
  const mq = new Query(this)

  return mq.search(query, filter)
}


BaseModel.prototype.init = function (obj, options) {
  this._doc = {}
  this._modifiedPath = []

  this.isNew = options?.isNew ?? true
  this.isDraft = options?.isDraft ?? false

  const schema = this.schema

  for (const [path, options] of Object.entries(schema.paths)) {
    if (options?.default !== undefined) {
      const defaultValue = typeof options.default === 'function'
        ? options.default()
        : options.default
      this.set(path, defaultValue, { skipMarkModified: true })
    }
  }

  if (obj) {
    for (const [key, value] of Object.entries(obj)) {
      this.set(key, value, { skipMarkModified: true })
    }
  }

  for (const path in this._doc) {
    Object.defineProperty(this, path, {
      enumerable: true,
      configurable: true,
      get: () => {
        return this.get(path)
      },
      set: (value) => {
        this.set(path, value)
      }
    })
  }
}

BaseModel.prototype.assign = function (obj) {
  for (const [path, value] of Object.entries(obj)) {
    if (this.get(path) !== value) {
      this.set(path, value)
    }
  }
  return this
}

BaseModel.prototype.delete = async function () {
  let docs = await this.model().fetch()

  await this.schema.execPre('delete', this)

  if (this.isDraft) {
    docs = docs.filter((doc) => doc.isDraft)

    const index = docs.findIndex((draft) => draft.id.toString() === this.id.toString())

    if (index !== -1) {
      docs.splice(index, 1)
      await AsyncStorage.setItem(`${this.model().collection}_drafts`, JSON.stringify(docs))
    }

    this.isDraft = false

    return
  }

  docs = docs.filter((doc) => !doc.isDraft)

  const index = docs.findIndex((doc) => doc.id.toString() === this.id.toString())
  if (index == -1)
    throw new Error('404')

  docs.splice(index, 1)

  const octokit = new Octokit({
    auth: this.model().db.token,
  })

  await octokit.repos.getContent(
    'stantanasi',
    'cookbook',
    `${this.model().collection}.json`,
    DATABASE_BRANCH,
  ).then((content) => octokit.repos.createOrUpdateFileContents(
    'stantanasi',
    'cookbook',
    `${this.model().collection}.json`,
    {
      content: Buffer.from(JSON.stringify(docs, null, 2)).toString('base64'),
      message: `feat(${this.model().collection}.json): delete ${this.id}`,
      sha: content.sha,
      branch: DATABASE_BRANCH,
    }
  ))

  this.model()._docs = JSON.parse(JSON.stringify(docs, null, 2))

  await this.schema.execPost('delete', this)
}

BaseModel.prototype.get = function (path, options) {
  const schema = this.schema

  let value = this._doc[path]

  if (options?.getter !== false) {
    const getter = schema.paths[path]?.get
    if (getter) {
      value = getter(value)
    }
  }

  return value
}

BaseModel.prototype.isModified = function (path) {
  if (path) {
    return this._modifiedPath.includes(path)
  }

  return this._modifiedPath.length > 0
}

BaseModel.prototype.markModified = function (path) {
  this._modifiedPath.push(path)
}

BaseModel.prototype.populate = async function (path) {
  const value = this.get(path)

  const schema = this.schema
  const ref = models[schema.paths[path]?.ref ?? '']

  if (!ref) {
    return this
  }

  if (Array.isArray(value)) {
    this.set(path, await Promise.all(value.map((val) => ref.findById(val))))
  } else {
    this.set(path, await ref.findById(value))
  }

  return this as any
}

BaseModel.prototype.save = async function (options) {
  let docs = await this.model().fetch()

  await this.schema.execPre('save', this, [options])

  if (options?.asDraft) {
    docs = docs.filter((doc) => doc.isDraft)

    const index = docs.findIndex((doc) => doc.id.toString() === this.id.toString())

    if (index === -1) {
      docs.push(this)
    } else {
      docs[index] = this
    }
    await AsyncStorage.setItem(`${this.model().collection}_drafts`, JSON.stringify(docs))

    this.isDraft = true

    return this
  }

  docs = docs.filter((doc) => !doc.isDraft)

  const octokit = new Octokit({
    auth: this.model().db.token,
  })

  if (this.isNew) {
    docs.push(this)
  } else {
    const index = docs.findIndex((doc) => doc.id.toString() === this.id.toString())
    if (index == -1)
      throw new Error(`Model with ID ${this.id} does not exist in ${this.model().collection}`)

    docs[index] = this
  }

  await octokit.repos.getContent(
    'stantanasi',
    'cookbook',
    `${this.model().collection}.json`,
    DATABASE_BRANCH,
  ).then((content) => octokit.repos.createOrUpdateFileContents(
    'stantanasi',
    'cookbook',
    `${this.model().collection}.json`,
    {
      content: Buffer.from(JSON.stringify(docs, null, 2)).toString('base64'),
      message: `feat(${this.model().collection}.json): ${this.isNew ? 'add' : 'update'} ${this.id}`,
      sha: content.sha,
      branch: DATABASE_BRANCH,
    }
  ))

  if (this.isDraft) {
    await this.delete()
  }

  this.isNew = false

  this.model()._docs = JSON.parse(JSON.stringify(docs, null, 2))

  this._modifiedPath = []

  await this.schema.execPost('save', this, [options])

  return this
}

BaseModel.prototype.set = function (path, value, options) {
  const schema = this.schema

  if (options?.setter !== false) {
    const setter = schema.paths[path]?.set
    if (setter) {
      value = setter(value)
    }
  }

  this._doc[path] = value

  if (options?.skipMarkModified !== true) {
    this.markModified(path)
  }

  return this
}

BaseModel.prototype.toJSON = function () {
  return this.toObject()
}

BaseModel.prototype.toObject = function () {
  const schema = this.schema

  const obj: any = {}

  for (const [path, options] of Object.entries(schema.paths)) {
    let value = this.get(path)

    if (options?.transform) {
      value = options.transform(value)
    }

    if (value) {
      if (value instanceof Types.ObjectId) {
        obj[path] = value
      } else if (value instanceof BaseModel) {
        obj[path] = value.id
      } else if (Array.isArray(value)) {
        obj[path] = [...value]
      } else if (typeof value === 'object') {
        obj[path] = { ...value }
      } else {
        obj[path] = value
      }
    } else {
      obj[path] = value
    }
  }

  return obj
}

BaseModel.prototype.unmarkModified = function (path) {
  this._modifiedPath = this._modifiedPath.filter((p) => p !== path)
}

BaseModel.prototype.validate = function () {
  const schema = this.schema

  const errors: ModelValidationError<any> = {}

  for (const [path, options] of Object.entries(schema.paths)) {
    if (options?.validate) {
      const value = this.get(path)
      if (!options.validate(value)) {
        errors[path] = {
          path: path,
          value: value,
        }
      }
    }
  }

  return errors
}


export function model<DocType>(
  schema: Schema<DocType>,
  collection: string,
): ModelConstructor<DocType> {
  class ModelClass extends BaseModel { }

  ModelClass.db = database
  ModelClass.collection = collection

  ModelClass.schema = schema as Schema<any>
  ModelClass.prototype.schema = schema as Schema<any>

  return ModelClass as ModelConstructor<DocType>
}
