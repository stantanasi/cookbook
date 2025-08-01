import { model, Schema } from '../utils/database';
import Octokit from '../utils/octokit/octokit';

export interface IUser {
  id: string;
  pseudo: string;
  avatar: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  followers: number;
  following: number;
  url: string;
}


const UserSchema = new Schema<IUser>({
  id: {},
});


class User extends model<IUser>(UserSchema, 'users') {

  static async fromGithub(id?: number) {
    const octokit = new Octokit({
      auth: this.client.token,
    });

    const user = id
      ? await octokit.users.getUser(id)
      : await octokit.users.getAuthenticatedUser();

    return new User({
      id: user.id.toString(),
      pseudo: user.login,
      avatar: user.avatar_url,
      name: user.name,
      bio: user.bio,
      location: user.location,
      company: user.company,
      followers: user.followers,
      following: user.following,
      url: user.html_url,
    });
  }
}

User.register('User');

export default User;
