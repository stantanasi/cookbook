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

}