import ModelFunction, { TModel } from "./model";
import Schema from "./schema";

class Database {
  token?: string
}

const database = new Database()

export default Database


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
  const model = ModelFunction as TModel<DocType>;

  model.db = database
  model.collection = collection

  model.schema = schema
  model.prototype.schema = schema

  return model;
}
