import { model, Schema, Types } from "../utils/mongoose"

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
