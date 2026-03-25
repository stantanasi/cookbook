export const GITHUB_OWNER = 'stantanasi';

export const GITHUB_REPOSITORY = 'cookbook';

export const DATABASE_BRANCH = 'database';

export const STORAGE_BRANCH = 'storage';


class Client {
  token?: string;
}

const client = new Client();


export { client };

export function connect(token: string) {
  client.token = token;
}

export function disconnect() {
  client.token = undefined;
}

export default Client;
