import { model, Schema } from "../utils/database"

export interface ICategory {
  id: string
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
