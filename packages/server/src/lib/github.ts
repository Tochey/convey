import { Octokit } from "@octokit/core";
import { OctokitResponse } from "@octokit/types";

export class Github {
  private client: Octokit;
  private headers = {
    "X-GitHub-Api-Version": "2022-11-28",
  };
  private url: string;

  constructor(url: string) {
    this.client = new Octokit();
    this.url = url;
  }

  public async validate() {
    const url = this.url.match(/github\.com\/([^/]+)\/([^/]+)\/?$/);

    if (!url) {
      throw new Error("Invalid GitHub repository URL");
    }

    const [_, owner, repo] = url;

    try {
      return await this.client.request("GET /repos/{owner}/{repo}", {
        owner: owner as string,
        repo: repo as string,
        headers: this.headers,
      });
    } catch (err) {
      console.error(err);
      throw new Error("Could not GET github repo");
    }
  }
}
