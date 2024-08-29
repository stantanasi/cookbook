import { model } from "../utils/database/database"
import Schema from "../utils/database/schema"
import { Types } from "../utils/database/types"

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


const CategoryModel = model<ICategory>(CategorySchema, 'categories')
export default CategoryModel


export const CATEGORY_ALL = new CategoryModel({
  id: undefined,
  name: "Tout",
})
