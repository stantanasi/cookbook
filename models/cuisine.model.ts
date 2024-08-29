import { model } from "../utils/database/database"
import Schema from "../utils/database/schema"
import { Types } from "../utils/database/types"

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
