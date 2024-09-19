import ModelFunction, { TModel } from "./model";
import Schema from "./schema";

class Database {
  token?: string
}

export default Database


const database = new Database()

export function connect(token: string) {
  database.token = token
}

export function disconnect() {
  database.token = undefined
}


export function model<DocType>(
  schema: Schema<DocType>,
  collection: string,
): TModel<DocType> {
  const model: TModel<DocType> = function (this, obj, options) {
    ModelFunction.call(this as any, obj, options)
  } as TModel<DocType>;

  if (!(model.prototype instanceof ModelFunction)) {
    Object.setPrototypeOf(model, ModelFunction);
    Object.setPrototypeOf(model.prototype, ModelFunction.prototype);
  }

  model.db = database
  model.collection = collection

  model.schema = schema
  model.prototype.schema = schema

  model.prototype.model = function () {
    return model
  }

  return model;
}
