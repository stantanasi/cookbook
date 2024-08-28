import { model } from "../utils/database/database"
import Schema from "../utils/database/schema"

export interface ICuisine {
  id: string
  name: string
}

const CuisineSchema = new Schema<ICuisine>({
  name: {
    default: '',
  },
}, {
  timestamps: true,
})


const CuisineModel = model<ICuisine>(CuisineSchema, 'cuisines')
export default CuisineModel
