import { model, Schema } from "../utils/database"

export interface IUser {
  id: string
  pseudo: string
  avatar: string
  name: string | null
  bio: string | null
  location: string | null
  company: string | null
  followers: number
  following: number
  url: string
}


const UserSchema = new Schema<IUser>({
  id: {},
})


class User extends model<IUser>(UserSchema, 'users') { }

User.register('User')

export default User
