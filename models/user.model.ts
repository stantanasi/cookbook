import { model } from "../utils/database/database"
import Query from "../utils/database/query"
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


class UserQuery<ResultType> extends Query<ResultType, IUser> {

  exec = async (): Promise<ResultType> => {
    const options = this.getOptions()

    if (options.op !== 'findOne' || !options.filter?.id) {
      throw new Error('Operation not implemented')
    }

    const octokit = new Octokit({
      auth: this.model.db.token,
    })

    const user = await octokit.users.getUser(options.filter.id)
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
      .catch(() => null)

    return user as ResultType
  }
}


const UserModel = model<IUser>(UserSchema, '')

UserModel.findById = function (id) {
  const mq = new UserQuery(this)

  return mq.findById(id)
}

export default UserModel
