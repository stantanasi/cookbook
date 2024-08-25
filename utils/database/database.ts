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