import { Buffer } from 'buffer'
import { randomUUID } from "expo-crypto"
import Octokit from "../octokit/octokit"
import { removeDiacritics } from "../utils"
import Database from "./database"
import Schema from "./schema"

interface ModelConstructor<DocType> {

  (
    this: ModelInstance<DocType>,
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      skipId?: boolean,
    },
  ): Model<DocType>
  new(
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      skipId?: boolean,
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
    options?: {
      filter?: {
        [P in keyof DocType]?: DocType[P]
      },
      sort?: {
        [P in keyof DocType]?: -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending'
      },
    },
  ): Promise<Model<DocType>[]>

  /** Finds a single document by its id. */
  findById(id: any): Promise<Model<DocType> | null>

  /** Schema the model uses. */
  schema: Schema<DocType>

  /** Searches for documents that match the provided query string. */
  search(query: string): Promise<Model<DocType>[]>
}

class ModelInstance<DocType> {

  /** This documents id. */
  id!: string

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

  if (options?.skipId !== true) {
    this.id = randomUUID()
  }

  // Avoid setting `isNew` to `true`, because it is `true` by default
  if (options?.isNew != null && options.isNew !== true) {
    this.isNew = options.isNew
  }

  const schema = this.schema

  for (const [path, options] of Object.entries(schema.paths)) {
    if (options?.default !== undefined) {
      this.set(path, options.default, { skipMarkModified: true })
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
  const branch = await octokit.branches.getBranch('stantanasi', 'cookbook', 'main')
  return fetch(`https://raw.githubusercontent.com/stantanasi/cookbook/${branch.commit.sha}/data/${this.collection}.json`)
    .then((res) => res.json())
    .then((data: any[]) => {
      this._docs = data.map((doc) => new this(doc, {
        isNew: false,
        skipId: true,
      }))
      return this._docs
    })
}

ModelFunction.find = async function (options) {
  let docs = await this.fetch()
  docs = [...docs]

  // Apply filter
  if (options?.filter) {
    docs = docs.filter((doc) => {
      return Object.entries(options.filter!)
        .every(([path, value]) => {
          return doc[path] === value
        })
    })
  }

  // Apply sorting
  if (options?.sort) {
    const sort = Object.entries(options.sort);
    docs.sort((a, b) => {
      for (const [path, order] of sort) {
        const aValue = a[path];
        const bValue = b[path];

        if (aValue < bValue) {
          return order === -1 || order === 'desc' || order === 'descending' ? 1 : -1;
        }
        if (aValue > bValue) {
          return order === -1 || order === 'desc' || order === 'descending' ? -1 : 1;
        }
      }
      return 0;
    })
  }

  return docs
}

ModelFunction.findById = async function (id) {
  const docs = await this.fetch()

  const doc = docs.find((doc) => doc.id == id)

  if (!doc) {
    return null
  }

  return doc
}

ModelFunction.search = async function (query) {
  const docs = await this.fetch()

  const schema = this.schema

  return docs
    .map((doc) => {
      const score = Object.entries(schema.paths)
        .filter(([_, options]) => options?.searchable === true)
        .map(([path], i1, paths) => {
          const words = [query].concat(query.split(" "))
            .filter((word) => !!word)

          return words.map((word, i2, words) => {
            const coef = (paths.length - i1) * (words.length - i2)
            let score = 0

            // Direct match scoring
            if (doc[path].match(new RegExp(`^${word}$`, 'i')))
              score += 100 * coef
            if (doc[path].match(new RegExp(`^${word}`, 'i')))
              score += 90 * coef
            if (doc[path].match(new RegExp(`\\b${word}\\b`, 'i')))
              score += 70 * coef
            if (doc[path].match(new RegExp(`\\b${word}`, 'i')))
              score += 50 * coef
            if (doc[path].match(new RegExp(`${word}`, 'i')))
              score += 40 * coef

            // Match scoring without diacritics
            const sanitizedValue = removeDiacritics(doc[path]);
            if (sanitizedValue.match(new RegExp(`^${word}$`, 'i')))
              score += 95 * coef
            if (sanitizedValue.match(new RegExp(`^${word}`, 'i')))
              score += 85 * coef
            if (sanitizedValue.match(new RegExp(`\\b${word}\\b`, 'i')))
              score += 65 * coef
            if (sanitizedValue.match(new RegExp(`\\b${word}`, 'i')))
              score += 45 * coef
            if (sanitizedValue.match(new RegExp(`${word}`, 'i')))
              score += 35 * coef

            return score
          }).reduce((acc, cur) => acc + cur, 0)
        })
        .reduce((acc, cur) => acc + cur, 0)


      return {
        doc: doc,
        score: score,
      }
    })
    .sort((a, b) => b.score - a.score)
    .filter((result) => result.score != 0)
    .map((result) => result.doc)
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
    `data/${this.model().collection}.json`,
  ).then((content) => octokit.repos.createOrUpdateFileContents(
    'stantanasi',
    'cookbook',
    `data/${this.model().collection}.json`,
    {
      content: Buffer.from(JSON.stringify(docs, null, 2)).toString('base64'),
      message: `feat(${this.model().collection}.json): delete ${this.id}`,
      sha: content.sha,
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

ModelFunction.prototype.model = function () {
  return ModelFunction
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
    `data/${this.model().collection}.json`,
  ).then((content) => octokit.repos.createOrUpdateFileContents(
    'stantanasi',
    'cookbook',
    `data/${this.model().collection}.json`,
    {
      content: Buffer.from(JSON.stringify(docs, null, 2)).toString('base64'),
      message: `feat(${this.model().collection}.json): ${this.isNew ? 'add' : 'update'} ${this.id}`,
      sha: content.sha,
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

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        obj[path] = [...value]
      } else {
        obj[path] = { ...value }
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
