import AsyncStorage from "@react-native-async-storage/async-storage"
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

export default class UserModel implements IUser {

  id: number = 0
  pseudo: string = ""
  avatar: string = ""
  name: string | null = null
  bio: string | null = null
  location: string | null = null
  company: string | null = null
  followers: number = 0
  following: number = 0
  url: string = ""

  constructor(
    data?: Partial<IUser>,
  ) {
    Object.assign(this, data)
  }


  static async findById(id: number): Promise<UserModel | null> {
    const octokit = new Octokit({
      auth: await AsyncStorage.getItem("github_token") ?? undefined,
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
}