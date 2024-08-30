import { Buffer } from 'buffer'
import Octokit from "../octokit/octokit"
import Database from "./database"
import { DATABASE_BRANCH } from './environment'
import Query, { FilterQuery } from './query'
import Schema from "./schema"
import { Types } from './types'

interface ModelConstructor<DocType> {

  (
    this: ModelInstance<DocType>,
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
    },
  ): Model<DocType>
  new(
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
    },
  ): Model<DocType>


  _docs: Model<DocType>[]

  /** The name of the collection the model is associated with. */
  collection: string

  /** Connection the model uses. */
  db: Database

  /** Fetches all documents from the collection. */
  fetch(): Promise<Model<DocType>[]>

  /** Creates a `find` query: gets a list of documents that match `filter`. */
  find(
    filter?: FilterQuery<DocType>,
  ): Query<Model<DocType>[], DocType>

  /** Finds a single document by its id. */
  findById(id: Types.ObjectId | any): Query<Model<DocType> | null, DocType>

  /** Schema the model uses. */
  schema: Schema<DocType>

  /** Searches for documents that match the provided query string. */
  search(query: string): Query<Model<DocType>[], DocType>
}

class ModelInstance<DocType> {

  /** This documents id. */
  id!: Types.ObjectId

  _doc!: DocType
  _modifiedPath!: (keyof DocType)[]

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

  /**
   * Returns true if any of the given paths are modified, else false. If no arguments, returns `true` if any path
   * in this document is modified.
   */
  isModified!: <T extends keyof DocType>(path?: T) => boolean

  /** Boolean flag specifying if the ModelFunction is new. */
  isNew!: boolean

  /** Marks the path as having pending changes to write to the db. */
  markModified!: <T extends keyof DocType>(path: T) => void

  model!: () => TModel<DocType>

  /** Saves this Document in the db by inserting a new Document into the database if Model.isNew is `true`, or update if `isNew` is `false`. */
  save!: () => Promise<this>

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
}

export type TModel<DocType> = (typeof ModelInstance<DocType>) & ModelConstructor<DocType>

export type Model<DocType> = DocType & ModelInstance<DocType>


const ModelFunction: TModel<Record<string, any>> = function (obj, options) {
  this._doc = {}
  this._modifiedPath = []

  // Avoid setting `isNew` to `true`, because it is `true` by default
  if (options?.isNew != null && options.isNew !== true) {
    this.isNew = options.isNew
  }

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
} as TModel<Record<string, any>>


ModelFunction._docs = []

ModelFunction.fetch = async function () {
  if (this._docs.length > 0) {
    return this._docs
  }

  const octokit = new Octokit({
    auth: this.db.token,
  })
  const branch = await octokit.branches.getBranch('stantanasi', 'cookbook', DATABASE_BRANCH)
  return fetch(`https://raw.githubusercontent.com/stantanasi/cookbook/${branch.commit.sha}/${this.collection}.json`)
    .then((res) => res.json())
    .then((data: any[]) => {
      this._docs = data.map((doc) => new this(doc, {
        isNew: false,
      }))
      return this._docs
    })
}

ModelFunction.find = function (filter) {
  const mq = new Query(this)

  return mq.find(filter)
}

ModelFunction.findById = function (id) {
  const mq = new Query(this)

  return mq.findById(id)
}

ModelFunction.search = function (query) {
  const mq = new Query(this)

  return mq.search(query)
}


ModelFunction.prototype._doc = {}
ModelFunction.prototype._modifiedPath = []

ModelFunction.prototype.assign = function (obj) {
  for (const [path, value] of Object.entries(obj)) {
    if (this.get(path) !== value) {
      this.set(path, value)
    }
  }
  return this
}

ModelFunction.prototype.delete = async function () {
  const docs = await this.model().fetch()

  await this.schema.execPre('delete', this)

  const index = docs.findIndex((doc) => doc.id === this.id)
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
}

ModelFunction.prototype.get = function (path, options) {
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

ModelFunction.prototype.isModified = function (path) {
  if (path) {
    return this._modifiedPath.includes(path)
  }

  return this._modifiedPath.length > 0
}

ModelFunction.prototype.isNew = true

ModelFunction.prototype.markModified = function (path) {
  this._modifiedPath.push(path)
}

ModelFunction.prototype.save = async function () {
  const docs = await this.model().fetch()

  await this.schema.execPre('save', this)

  const octokit = new Octokit({
    auth: this.model().db.token,
  })

  if (this.isNew) {
    docs.push(this)
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

  return this
}

ModelFunction.prototype.set = function (path, value, options) {
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

ModelFunction.prototype.toJSON = function () {
  return this.toObject()
}

ModelFunction.prototype.toObject = function () {
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

ModelFunction.prototype.unmarkModified = function (path) {
  this._modifiedPath = this._modifiedPath.filter((p) => p !== path)
}


export default ModelFunction
