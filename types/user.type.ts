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