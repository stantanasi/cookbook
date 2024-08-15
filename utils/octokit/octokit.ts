export default class Octokit {

  private auth?: string

  constructor(
    options?: {
      auth?: string,
    },
  ) {
    this.auth = options?.auth
  }
}