import { model } from "../utils/database/database"
import Schema from "../utils/database/schema"
import Octokit from "../utils/octokit/octokit"

export interface IUser {
  id: number
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

const UserSchema = new Schema<IUser>({})


const UserModel = model<IUser>(UserSchema, '')

UserModel.findById = async function (id) {
  const octokit = new Octokit({
    auth: this.db.token,
  })

  return octokit.users.getUser(id)
    .then((user) => {
      return new UserModel({
        id: user.id,
        pseudo: user.login,
        avatar: user.avatar_url,
        name: user.name,
        bio: user.bio,
        location: user.location,
        company: user.company,
        followers: user.followers,
        following: user.following,
        url: user.html_url,
      })
    })
}

export default UserModel
