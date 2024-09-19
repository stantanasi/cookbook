import { model } from "../utils/mongoose/database"
import Schema from "../utils/mongoose/schema"
import { Types } from "../utils/mongoose/types"

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


const CuisineModel = model<ICuisine>(CuisineSchema, 'cuisines')
export default CuisineModel
