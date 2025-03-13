import { model, Schema, Types } from "../utils/mongoose"

export interface ICategory {
  id: Types.ObjectId
  name: string
}

const CategorySchema = new Schema<ICategory>({
  name: {
    default: '',
  },
}, {
  timestamps: true,
})


class Category extends model<ICategory>(CategorySchema, 'categories') { }

Category.register('Category')

export default Category


export const CATEGORY_ALL = new Category({
  id: undefined,
  name: "Tout",
})
