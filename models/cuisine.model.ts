import { model, Schema, Types } from "../utils/database"

export interface ICuisine {
  id: Types.ObjectId
  name: string
}

const CuisineSchema = new Schema<ICuisine>({
  name: {
    default: '',
  },
}, {
  timestamps: true,
})


class Cuisine extends model<ICuisine>(CuisineSchema, 'cuisines') { }

Cuisine.register('Cuisine')

export default Cuisine
