import { randomUUID } from "expo-crypto"

export namespace Types {

  export class ObjectId {

    private _id: string
    get id(): ObjectId {
      return this
    }

    constructor(inputId?: string | ObjectId) {
      if (!inputId) {
        this._id = ObjectId.generate().toString()
      } else if (inputId instanceof ObjectId) {
        this._id = inputId.toString()
      } else {
        this._id = inputId
      }
    }

    private static generate(): ObjectId {
      return new ObjectId(randomUUID())
    }

    equals(otherId: ObjectId): boolean {
      return this.toString() === otherId.toString()
    }

    toString(): string {
      return this._id
    }

    toJSON(): string {
      return this._id
    }
  }
}