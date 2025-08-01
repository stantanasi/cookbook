import { model, Schema } from "../utils/database";

export interface ICuisine {
  id: string;
  name: string;
}

const CuisineSchema = new Schema<ICuisine>({
  name: {
    default: '',
  },
}, {
  timestamps: true,
});


class Cuisine extends model<ICuisine>(CuisineSchema, 'cuisines') { }

Cuisine.register('Cuisine');

export default Cuisine;
