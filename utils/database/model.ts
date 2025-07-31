import { createSelector, createSlice, PayloadAction, Slice } from '@reduxjs/toolkit'
import { Buffer } from 'buffer'
import { AppDispatch, RootState, State } from '../../redux/store'
import Octokit from "../octokit/octokit"
import { search } from '../utils'
import Client, { client, DATABASE_BRANCH } from "./client"
import { ModelValidationError } from './error'
import Query, { FilterQuery } from './query'
import Schema from "./schema"

const models: {
  [name: string]: ModelConstructor<any>,
} = {}

export type ExtractDocType<T> =
  T extends Model<infer DocType> ? DocType :
  T extends Model<infer DocType>[] ? DocType :
  never

export type SelectorParams<DocType> = {
  filter?: {
    [K in keyof DocType]?: DocType[K]
  } & {
    [key: string]: any
  } & {
    $and?: NonNullable<SelectorParams<DocType>['filter']>[]
    $or?: NonNullable<SelectorParams<DocType>['filter']>[]
    $search?: string
  }
  sort?: {
    [K in keyof DocType]?: -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending'
  } & {
    [key: string]: -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending'
  }
  limit?: number
  offset?: number
}

export default class Model<DocType extends Record<string, any>> {

  static _docs: any[] = []
  static _drafts: any[] = []

  /** Connection the model uses. */
  static client: Client

  /** The name of the collection the model is associated with. */
  static collection: string

  /** Schema the model uses. */
  static schema: Schema<any>

  static slice: Slice<State<any>>

  /** Creates a `count` query: gets the count of documents that match `filter`. */
  static count<T extends ModelConstructor<any>>(
    this: T,
    filter?: FilterQuery<ExtractDocType<InstanceType<T>>>,
  ): Query<number, ExtractDocType<InstanceType<T>>> {
    const mq = new Query(this)

    return mq.count(filter)
  }

  static createSlice<T extends ModelConstructor<any>>(
    this: T,
    name: string,
  ): Slice<State<ExtractDocType<InstanceType<T>>>> {
    const initialState: State<ExtractDocType<InstanceType<T>>> = {
      entities: {},
      drafts: {},
    }

    const slice = createSlice({
      name: name,
      initialState: initialState,
      reducers: {
        setOne: (state, action: PayloadAction<ExtractDocType<InstanceType<T>>>) => {
          const doc = action.payload

          state.entities[doc.id] = doc as any
        },
        setOneDraft: (state, action: PayloadAction<ExtractDocType<InstanceType<T>>>) => {
          const doc = action.payload

          state.drafts[doc.id] = doc as any
        },

        removeOne: (state, action: PayloadAction<string>) => {
          const id = action.payload

          delete state.entities[id]
        },
        removeOneDraft: (state, action: PayloadAction<string>) => {
          const id = action.payload

          delete state.drafts[id]
        },
      },
    })

    this.slice = slice

    return slice
  }

  /** Fetches all documents from the collection. */
  static async fetch<T extends ModelConstructor<any>>(
    this: T,
    dispatch: AppDispatch,
  ): Promise<void> {
    const octokit = new Octokit({
      auth: this.client.token,
    })
    const branch = await octokit.branches.getBranch('stantanasi', 'cookbook', DATABASE_BRANCH)

    this._docs = await fetch(`https://raw.githubusercontent.com/stantanasi/cookbook/${branch.commit.sha}/${this.collection}.json`)
      .then((res) => res.json())
    for (const doc of this._docs) {
      dispatch(this.slice.actions.setOne(doc))
    }

    this._drafts = await fetch(`https://raw.githubusercontent.com/stantanasi/cookbook/${branch.commit.sha}/${this.collection}_drafts.json`)
      .then((res) => res.json())
      .catch(() => [])
    for (const draft of this._drafts) {
      dispatch(this.slice.actions.setOneDraft(draft))
    }
  }

  /** Creates a `find` query: gets a list of documents that match `filter`. */
  static find<T extends ModelConstructor<any>>(
    this: T,
    filter?: FilterQuery<ExtractDocType<InstanceType<T>>>,
  ): Query<InstanceType<T>[], ExtractDocType<InstanceType<T>>> {
    const mq = new Query(this)

    return mq.find(filter)
  }

  static _findReduxSelector: typeof this.findRedux
  static findRedux<T extends ModelConstructor<any>>(
    this: T,
    state: RootState,
    params?: SelectorParams<ExtractDocType<InstanceType<T>>>,
  ): InstanceType<T>[] {
    if (!this._findReduxSelector) {
      this._findReduxSelector = createSelector([
        (state: RootState) => state,
        (state: RootState) => state[this.slice.name as keyof RootState].entities,
        (state: RootState) => state[this.slice.name as keyof RootState].drafts,
        (_state: RootState, params?: SelectorParams<ExtractDocType<InstanceType<T>>>) => params,
      ], (state, entities, drafts_entities, params) => {
        const docs: InstanceType<T>[] = Object.values(entities)
          .filter((entity) => entity)
          .map((entity) => {
            return new this({
              ...entity,
            }, { isNew: false })
          })

        const drafts: InstanceType<T>[] = Object.values(drafts_entities)
          .filter((entity) => entity)
          .map((entity) => {
            return new this({
              ...entity,
            }, {
              isNew: !docs.some((doc) => doc.id === entity.id),
              isDraft: true,
            })
          })

        let res = [...drafts, ...docs].filter((a, index, arr) => {
          return index === arr.findIndex((b) => a.id.toString() === b.id.toString())
        })

        // Apply filter
        if (params?.filter) {
          const applyFilter = (doc: InstanceType<T>, filter: NonNullable<SelectorParams<ExtractDocType<InstanceType<T>>>['filter']>): boolean => {
            const keys = Object.keys(filter) as (keyof SelectorParams<ExtractDocType<InstanceType<T>>>['filter'])[]
            return keys.every((key) => {
              if (key === "$and") {
                if (!filter.$and || filter.$and.length === 0) return true
                return filter.$and.every((subFilter) => applyFilter(doc, subFilter))
              } else if (key === "$or") {
                if (!filter.$or || filter.$or.length === 0) return true
                return filter.$or.some((subFilter) => applyFilter(doc, subFilter))
              } else if (key === '$search') {
                return true
              } else {
                const value = filter[key]
                return doc[key] == value
              }
            })
          }

          res = res.filter((doc) => applyFilter(doc, params.filter!))
        }

        // Apply sorting
        if (params?.sort) {
          const sort = Object.entries(params.sort)
          res.sort((a, b) => {
            for (const [path, order] of sort) {
              const aValue = a[path]
              const bValue = b[path]

              if (aValue < bValue) {
                return order === -1 || order === 'desc' || order === 'descending' ? 1 : -1
              }
              if (aValue > bValue) {
                return order === -1 || order === 'desc' || order === 'descending' ? -1 : 1
              }
            }
            return 0
          })
        }

        // Apply search
        if (params?.filter?.$search) {
          const query = params.filter.$search

          res = search(
            query,
            res,
            Object.entries(this.schema.paths)
              .filter(([_, options]) => options?.searchable === true)
              .map(([path]) => path)
          )
        }

        // Apply limit and offset
        if (params?.limit || params?.offset) {
          const start = params.offset ?? 0
          const end = start + (params.limit ?? res.length)
          res = res.slice(start, end)
        }

        return res
      })
    }

    return this._findReduxSelector(state, params)
  }

  /** Finds a single document by its id. */
  static findById<T extends ModelConstructor<any>>(
    this: T,
    id: string,
  ): Query<InstanceType<T> | null, ExtractDocType<InstanceType<T>>> {
    const mq = new Query(this)

    return mq.findById(id)
  }

  static findByIdRedux<T extends ModelConstructor<any>>(
    this: T,
    state: RootState,
    id: string,
    params?: SelectorParams<ExtractDocType<InstanceType<T>>>,
  ): InstanceType<T> | undefined {
    return this.findRedux(state, {
      ...params,
      filter: {
        ...params?.filter,
        id: id,
      } as any,
    })[0]
  }

  static register<T extends ModelConstructor<any>>(
    this: T,
    name: string,
  ): void {
    models[name] = this

    this.prototype.model = () => {
      return this
    }
  }

  /** Searches for documents that match the provided query string. */
  static search<T extends ModelConstructor<any>>(
    this: T,
    query: string,
    filter?: FilterQuery<ExtractDocType<InstanceType<T>>>,
  ): Query<InstanceType<T>[], ExtractDocType<InstanceType<T>>> {
    const mq = new Query(this)

    return mq.search(query, filter)
  }

  static searchRedux<T extends ModelConstructor<any>>(
    this: T,
    state: RootState,
    query: string,
    params?: SelectorParams<ExtractDocType<InstanceType<T>>>,
  ): InstanceType<T>[] {
    return this.findRedux(state, {
      ...params,
      filter: {
        ...params?.filter,
        $search: query,
      } as SelectorParams<ExtractDocType<InstanceType<T>>>['filter'],
    })
  }


  /** This documents id. */
  id!: string

  private _doc: DocType = {} as DocType
  private _modifiedPath: (keyof DocType)[] = []

  /** Boolean flag specifying if the ModelFunction is new. */
  isNew: boolean = true

  /** Boolean flag specifying if the ModelFunction is a draft. */
  isDraft: boolean = false

  /** The document's schema. */
  schema!: Schema<DocType>

  constructor(
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      isDraft?: boolean,
    },
  ) {
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

    for (const path in this['_doc']) {
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

  /** Assigns values to the document. */
  assign(obj: Partial<DocType>): this {
    for (const [path, value] of Object.entries(obj)) {
      if (this.get(path) !== value) {
        this.set(path, value)
      }
    }
    return this
  }

  /** Removes this document from the db. */
  async delete(): Promise<void> {
    const octokit = new Octokit({
      auth: this.model().client.token,
    })

    const docs = this.model()._docs.map((doc) => new (this.model())(doc, {
      isNew: false,
    }))
    const drafts = this.model()._drafts.map((draft) => new (this.model())(draft, {
      isNew: !docs.some((doc) => doc.id.toString() === draft.id.toString()),
      isDraft: true,
    })).map((draft) => {
      const saved = docs.find((doc) => doc.id.toString() === draft.id.toString())

      Object.keys(this.schema.paths)
        .filter((path) => {
          if (saved) {
            return saved.get(path) !== draft.get(path)
          } else {
            const defaultFunction = this.model().schema.paths[path]?.default
            const defaultValue = typeof defaultFunction === 'function'
              ? defaultFunction()
              : defaultFunction

            return defaultValue !== draft.get(path)
          }
        })
        .forEach((path) => draft.markModified(path))

      return draft
    })

    await this.schema.execPre('delete', this)

    if (this.isDraft) {
      const index = drafts.findIndex((draft) => draft.id.toString() === this.id.toString())

      if (index !== -1) {
        drafts.splice(index, 1)

        await octokit.repos.getContent(
          'stantanasi',
          'cookbook',
          `${this.model().collection}_drafts.json`,
          DATABASE_BRANCH,
        ).then((content) => octokit.repos.createOrUpdateFileContents(
          'stantanasi',
          'cookbook',
          `${this.model().collection}_drafts.json`,
          {
            content: Buffer.from(JSON.stringify(drafts, null, 2)).toString('base64'),
            message: `feat(${this.model().collection}.json): delete ${this.id}`,
            sha: content.sha,
            branch: DATABASE_BRANCH,
          }
        ))
      }

      this.isDraft = false

      return
    }

    const index = docs.findIndex((doc) => doc.id.toString() === this.id.toString())
    if (index == -1)
      throw new Error('404')

    docs.splice(index, 1)

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

  /** Returns the value of a path. */
  get<T extends keyof DocType>(
    path: T,
    options?: {
      getter?: boolean,
    },
  ): DocType[T] {
    const schema = this.schema

    let value = this['_doc'][path]

    if (options?.getter !== false) {
      const getter = schema.paths[path]?.get
      if (getter) {
        value = getter(value)
      }
    }

    return value
  }

  /**
   * Returns true if any of the given paths are modified, else false. If no arguments, returns `true` if any path
   * in this document is modified.
   */
  isModified<T extends keyof DocType>(path?: T): boolean {
    if (path) {
      return this['_modifiedPath'].includes(path)
    }

    return this['_modifiedPath'].length > 0
  }

  /** Marks the path as having pending changes to write to the db. */
  markModified<T extends keyof DocType>(path: T): void {
    this['_modifiedPath'].push(path)
  }

  model!: () => ModelConstructor<DocType>

  /** Populates document references. */
  async populate(
    path: keyof DocType,
  ): Promise<this> {
    const value = this.get(path)

    const schema = this.schema
    const ref = models[schema.paths[path]?.ref ?? '']

    if (!ref) {
      return this
    }

    if (Array.isArray(value)) {
      this.set(path, await Promise.all(value.map((val: any) => ref.findById(val))) as any)
    } else {
      this.set(path, await ref.findById(value))
    }

    return this as any
  }

  /** Saves this Document in the db by inserting a new Document into the database if Model.isNew is `true`, or update if `isNew` is `false`. */
  async save(
    options?: {
      asDraft?: boolean,
    },
  ): Promise<this> {
    const octokit = new Octokit({
      auth: this.model().client.token,
    })

    const docs = this.model()._docs.map((doc) => new (this.model())(doc, {
      isNew: false,
    }))
    const drafts = this.model()._drafts.map((draft) => new (this.model())(draft, {
      isNew: !docs.some((doc) => doc.id.toString() === draft.id.toString()),
      isDraft: true,
    })).map((draft) => {
      const saved = docs.find((doc) => doc.id.toString() === draft.id.toString())

      Object.keys(this.schema.paths)
        .filter((path) => {
          if (saved) {
            return saved.get(path) !== draft.get(path)
          } else {
            const defaultFunction = this.model().schema.paths[path]?.default
            const defaultValue = typeof defaultFunction === 'function'
              ? defaultFunction()
              : defaultFunction

            return defaultValue !== draft.get(path)
          }
        })
        .forEach((path) => draft.markModified(path))

      return draft
    })

    await this.schema.execPre('save', this, [options])

    if (options?.asDraft) {
      const index = drafts.findIndex((draft) => draft.id.toString() === this.id.toString())

      if (index === -1) {
        drafts.push(this as any)
      } else {
        drafts[index] = this as any
      }

      await octokit.repos.getContent(
        'stantanasi',
        'cookbook',
        `${this.model().collection}_drafts.json`,
        DATABASE_BRANCH,
      ).then((content) => octokit.repos.createOrUpdateFileContents(
        'stantanasi',
        'cookbook',
        `${this.model().collection}_drafts.json`,
        {
          content: Buffer.from(JSON.stringify(drafts, null, 2)).toString('base64'),
          message: `feat(${this.model().collection}.json): ${this.isNew ? 'add' : 'update'} ${this.id}`,
          sha: content.sha,
          branch: DATABASE_BRANCH,
        }
      ))

      this.isDraft = true

      this.model()._drafts = JSON.parse(JSON.stringify(drafts, null, 2))

      return this
    }

    if (this.isNew) {
      docs.push(this as any)
    } else {
      const index = docs.findIndex((doc) => doc.id.toString() === this.id.toString())
      if (index == -1)
        throw new Error(`Model with ID ${this.id} does not exist in ${this.model().collection}`)

      docs[index] = this as any
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

    this['_modifiedPath'] = []

    await this.schema.execPost('save', this, [options])

    return this
  }

  /** Sets the value of a path */
  set<T extends keyof DocType>(
    path: T,
    value: DocType[T],
    options?: {
      setter?: boolean,
      skipMarkModified?: boolean,
    },
  ): this {
    const schema = this.schema

    if (options?.setter !== false) {
      const setter = schema.paths[path]?.set
      if (setter) {
        value = setter(value)
      }
    }

    this['_doc'][path] = value

    if (options?.skipMarkModified !== true) {
      this.markModified(path)
    }

    return this
  }

  /** The return value of this method is used in calls to JSON.stringify(doc). */
  toJSON(): DocType {
    return this.toObject()
  }

  /** Converts this ModelFunction into a plain-old JavaScript object ([POJO](https://masteringjs.io/tutorials/fundamentals/pojo)). */
  toObject(): DocType {
    const schema = this.schema

    const obj: any = {}

    for (const [path, options] of Object.entries(schema.paths)) {
      let value: any = this.get(path)

      if (options?.transform) {
        value = options.transform(value)
      }

      if (value) {
        if (value instanceof Model) {
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

  /** Clears the modified state on the specified path. */
  unmarkModified<T extends keyof DocType>(path: T): void {
    this['_modifiedPath'] = this['_modifiedPath'].filter((p) => p !== path)
  }

  /** Executes registered validation rules for this document. */
  validate(
    options?: {
      pathsToSkip?: (keyof DocType)[],
    },
  ): ModelValidationError<DocType> | null {
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
}

export type ModelConstructor<DocType extends Record<string, any>> = Omit<typeof Model, 'constructor' | 'prototype'> & {

  new(
    obj?: Partial<DocType>,
    options?: {
      isNew?: boolean,
      isDraft?: boolean,
    },
  ): ModelInstance<DocType>

  prototype: ModelInstance<DocType>
}

export type ModelInstance<DocType extends Record<string, any>> = Model<DocType> & DocType


export function model<DocType extends Record<string, any>>(
  schema: Schema<DocType>,
  collection: string,
): ModelConstructor<DocType> {
  class ModelClass extends Model<DocType> { }

  ModelClass.client = client
  ModelClass.collection = collection

  ModelClass.schema = schema as Schema<any>
  ModelClass.prototype.schema = schema as Schema<any>

  return ModelClass as ModelConstructor<DocType>
}
