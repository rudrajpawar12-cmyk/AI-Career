export interface GithubProfile {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;

  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;

  public_repos: number;
  followers: number;
  following: number;

  created_at: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  html_url: string;
  description: string | null;

  stargazers_count: number;
  forks_count: number;

  language: string | null;

  updated_at: string;
}