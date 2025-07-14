import { search } from "../utils"
import { ModelConstructor, ModelInstance } from "./model"
import Schema from "./schema"
import { Types } from "./types"

export type FilterQuery<DocType> = {
  [P in keyof DocType]?: DocType[P]
} & {
  $and?: FilterQuery<DocType>[]
  $or?: FilterQuery<DocType>[]
  $search?: string
}

export type SortQuery<DocType> = {
  [P in keyof DocType]?: -1 | 1 | 'asc' | 'ascending' | 'desc' | 'descending'
}

interface QueryOptions<DocType> {
  op?: 'count' | 'find' | 'findOne' | 'search'
  filter?: FilterQuery<DocType>
  populate?: (keyof DocType)[]
  sort?: SortQuery<DocType>
  limit?: number
  skip?: number
}


class Query<ResultType, DocType> {

  constructor(model: ModelConstructor<DocType>) {
    this.init(model)
  }

  /**
   * Executes the query returning a `Promise` which will be
   * resolved with either the doc(s) or rejected with the error.
   * Like `.then()`, but only takes a rejection handler.
   */
  catch!: Promise<ResultType>['catch']

  /** Creates a `count` query: gets the count of documents that match `filter`. */
  count!: (
    filter?: FilterQuery<DocType>,
  ) => Query<number, DocType>

  exec!: () => Promise<ResultType>

  /**
   * Executes the query returning a `Promise` which will be
   * resolved with `.finally()` chained.
   */
  finally!: Promise<ResultType>['finally']

  /** Creates a `find` query: gets a list of documents that match `filter`. */
  find!: (
    filter?: FilterQuery<DocType>,
  ) => Query<ModelInstance<DocType>[], DocType>

  /** Declares the query a findById operation. When executed, returns the document with the given `_id`. */
  findById!: (id: Types.ObjectId | any) => Query<ModelInstance<DocType> | null, DocType>

  /** Gets query options. */
  getOptions!: () => QueryOptions<DocType>

  init!: (model: ModelConstructor<DocType>) => void

  /** Specifies the maximum number of documents the query will return. */
  limit!: (val: number) => this

  /** The model this query was created from */
  model!: ModelConstructor<DocType>

  options!: QueryOptions<DocType>

  /** Specifies paths which should be populated with other documents. */
  populate!: <Paths extends { [P in keyof DocType]?: DocType[P] } = {}>(
    path: keyof DocType,
  ) => Query<ResultType extends null ? null : ResultType & Paths, DocType>

  /** Searches for documents that match the provided query string. */
  search!: (
    query: string,
    filter?: FilterQuery<DocType>,
  ) => Query<ModelInstance<DocType>[], DocType>

  /** Sets query options. Some options only make sense for certain operations. */
  setOptions!: (options: QueryOptions<DocType>, overwrite?: boolean) => this

  /** Schema the model uses. */
  schema!: Schema<DocType>

  /** Specifies the number of documents to skip. */
  skip!: (val: number) => this

  /** Sets the sort order. If an object is passed, values allowed are `asc`, `desc`, `ascending`, `descending`, `1`, and `-1`. */
  sort!: (
    sort: SortQuery<DocType>,
  ) => this

  /**
   * Executes the query returning a `Promise` which will be
   * resolved with either the doc(s) or rejected with the error.
   */
  then!: Promise<ResultType>['then']
}

Query.prototype.init = function (model) {
  this.model = model
  this.schema = this.model.schema

  this.options = {}
}

Query.prototype.catch = function (reject) {
  return this.exec().then(null, reject)
}

Query.prototype.count = function (filter) {
  this.setOptions({
    op: 'count',
    filter: filter,
  })
  return this
}

Query.prototype.exec = async function exec() {
  const options = this.getOptions()
  const schema = this.schema

  const docs = await this.model.fetch()
  let res = [...docs].filter((a, index, arr) => {
    return index === arr.findIndex((b) => a.id.toString() === b.id.toString())
  })

  if (!options.op) {
    throw new Error('Query must have `op` before executing')
  }

  // Apply filter
  if (options?.filter) {
    const applyFilter = <DocType>(doc: DocType, filter: FilterQuery<DocType>): boolean => {
      const keys = Object.keys(filter) as Array<keyof FilterQuery<DocType>>
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
          const value = filter[key as keyof DocType]
          return doc[key as keyof DocType] == value
        }
      })
    }

    res = res.filter((doc) => applyFilter(doc, options.filter!))
  }

  if (options.op === 'count') {
    return res.length
  }

  // Apply sorting
  if (options?.sort) {
    const sort = Object.entries(options.sort)
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

  if (options.op === 'search' && options.filter?.$search) {
    const query = options.filter.$search

    res = search(
      query,
      res,
      Object.entries(schema.paths)
        .filter(([_, options]) => options?.searchable === true)
        .map(([path]) => path)
    )
  }

  if (options.limit || options.skip) {
    const start = options.skip ?? 0
    const end = start + (options.limit ?? res.length)
    res = res.slice(start, end)
  }

  if (options.populate) {
    for (const doc of res) {
      for (const path of options.populate) {
        await doc.populate(path)
      }
    }
  }

  if (options.op === 'findOne') {
    res = res[0] ?? null
  }

  return res
}

Query.prototype.finally = function (onFinally) {
  return this.exec().finally(onFinally)
}

Query.prototype.find = function (filter) {
  this.setOptions({
    op: 'find',
    filter: filter,
  })
  return this
}

Query.prototype.findById = function (id) {
  this.setOptions({
    op: 'findOne',
    filter: {
      id: id,
    },
    limit: 1,
  })
  return this
}

Query.prototype.getOptions = function () {
  return this.options
}

Query.prototype.limit = function (val) {
  this.setOptions({ limit: val })
  return this
}

Query.prototype.populate = function (path) {
  this.setOptions({
    populate: [path],
  })
  return this
}

Query.prototype.search = function (query, filter) {
  this.setOptions({
    op: 'search',
    filter: {
      ...filter,
      $search: query,
    },
  })
  return this
}

Query.prototype.setOptions = function (options, overwrite) {
  if (overwrite) {
    this.options = options
    return this
  }

  options = Object.assign({}, options)

  if (options.populate) {
    this.options.populate = this.options.populate || []
    this.options.populate = this.options.populate.concat(options.populate)
    delete options.populate
  }

  const merge = (target: any, source: any) => {
    Object.keys(source).forEach(key => {
      const s_val = source[key]
      const t_val = target[key]
      target[key] = t_val && s_val && typeof t_val === 'object' && typeof s_val === 'object'
        ? merge(t_val, s_val)
        : s_val
    })
    return target
  }

  merge(this.options, options)

  return this
}

Query.prototype.skip = function (val) {
  this.setOptions({ skip: val })
  return this
}

Query.prototype.sort = function (sort) {
  this.setOptions({ sort: sort })
  return this
}

Query.prototype.then = function (resolve, reject) {
  return this.exec().then(resolve, reject)
}


export default Query
