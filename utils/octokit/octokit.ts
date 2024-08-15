const GITHUB_BASE_API_URL = 'https://api.github.com'

export default class Octokit {

  private auth?: string

  constructor(
    options?: {
      auth?: string,
    },
  ) {
    this.auth = options?.auth
  }


  branches = {

    getBranch: async (
      owner: string,
      repo: string,
      branch: string,
    ): Promise<{
      name: string
      commit: {
        sha: string
        node_id: string
        commit: {
          author: {
            name: string
            email: string
            date: string
          }
          committer: {
            name: string
            email: string
            date: string
          }
          message: string
          tree: {
            sha: string
            url: string
          }
          url: string
          comment_count: number
          verification: {
            verified: boolean
            reason: string
            signature: any
            payload: any
          }
        }
        url: string
        html_url: string
        comments_url: string
        author: {
          login: string
          id: number
          node_id: string
          avatar_url: string
          gravatar_id: string
          url: string
          html_url: string
          followers_url: string
          following_url: string
          gists_url: string
          starred_url: string
          subscriptions_url: string
          organizations_url: string
          repos_url: string
          events_url: string
          received_events_url: string
          type: string
          site_admin: boolean
        }
        committer: {
          login: string
          id: number
          node_id: string
          avatar_url: string
          gravatar_id: string
          url: string
          html_url: string
          followers_url: string
          following_url: string
          gists_url: string
          starred_url: string
          subscriptions_url: string
          organizations_url: string
          repos_url: string
          events_url: string
          received_events_url: string
          type: string
          site_admin: boolean
        }
        parents: Array<{
          sha: string
          url: string
          html_url: string
        }>
      }
      _links: {
        self: string
        html: string
      }
      protected: boolean
      protection: {
        enabled: boolean
        required_status_checks: {
          enforcement_level: string
          contexts: Array<any>
          checks: Array<any>
        }
      }
      protection_url: string
    }> => {
      return await fetch(`${GITHUB_BASE_API_URL}/repos/${owner}/${repo}/branches/${branch}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          ...(this.auth && { 'Authorization': `Bearer ${this.auth}` }),
        },
      }).then((res) => {
        if (res.ok) return res.json()
        return Promise.reject(res)
      })
    },
  }


  repos = {

    getContent: async (
      owner: string,
      repo: string,
      path: string,
      ref?: string,
    ): Promise<{
      type: string
      encoding: string
      size: number
      name: string
      path: string
      content: string
      sha: string
      url: string
      git_url: string
      html_url: string
      download_url: string
      _links: {
        git: string
        self: string
        html: string
      }
    }> => {
      return await fetch(`${GITHUB_BASE_API_URL}/repos/${owner}/${repo}/contents/${path}?ref=${ref}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.github+json',
          ...(this.auth && { 'Authorization': `Bearer ${this.auth}` }),
        }
      }).then((res) => {
        if (res.ok) return res.json()
        return Promise.reject(res)
      })
    },

    createOrUpdateFileContents: async (
      owner: string,
      repo: string,
      path: string,
      body: {
        message: string,
        content: string,
        sha?: string,
        branch?: string,
        commiter?: {
          name: string,
          email: string,
          date?: string,
        },
        author?: {
          name: string,
          email: string,
          date?: string,
        },
      },
    ): Promise<{
      content: {
        name: string
        path: string
        sha: string
        size: number
        url: string
        html_url: string
        git_url: string
        download_url: string
        type: string
        _links: {
          self: string
          git: string
          html: string
        }
      }
      commit: {
        sha: string
        node_id: string
        url: string
        html_url: string
        author: {
          date: string
          name: string
          email: string
        }
        committer: {
          date: string
          name: string
          email: string
        }
        message: string
        tree: {
          url: string
          sha: string
        }
        parents: Array<{
          url: string
          html_url: string
          sha: string
        }>
        verification: {
          verified: boolean
          reason: string
          signature: any
          payload: any
        }
      }
    }> => {
      return fetch(`${GITHUB_BASE_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/vnd.github+json',
          ...(this.auth && { 'Authorization': `Bearer ${this.auth}` }),
        },
        body: JSON.stringify(body)
      }).then((res) => {
        if (res.ok) return res.json()
        return Promise.reject(res)
      })
    },

    deleteFile: async (
      owner: string,
      repo: string,
      path: string,
      body: {
        message: string,
        sha: string,
        branch?: string,
        commiter?: {
          name: string,
          email: string,
          date?: string,
        },
        author?: {
          name: string,
          email: string,
          date?: string,
        },
      },
    ): Promise<{
      content: null
      commit: {
        sha: string
        node_id: string
        url: string
        html_url: string
        author: {
          date: string
          name: string
          email: string
        }
        committer: {
          date: string
          name: string
          email: string
        }
        message: string
        tree: {
          url: string
          sha: string
        }
        parents: Array<{
          url: string
          html_url: string
          sha: string
        }>
        verification: {
          verified: boolean
          reason: string
          signature: any
          payload: any
        }
      }
    }> => {
      return fetch(`${GITHUB_BASE_API_URL}/repos/${owner}/${repo}/contents/${path}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/vnd.github+json',
          ...(this.auth && { 'Authorization': `Bearer ${this.auth}` }),
        },
        body: JSON.stringify(body)
      }).then((res) => {
        if (res.ok) return res.json()
        return Promise.reject(res)
      })
    },
  }
}