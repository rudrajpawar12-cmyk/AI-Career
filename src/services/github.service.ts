const BASE = "https://api.github.com";

export async function getGithubProfile(username: string) {
  const res = await fetch(`${BASE}/users/${username}`);

  if (!res.ok) {
    throw new Error("GitHub user not found");
  }

  return res.json();
}

export async function getGithubRepos(username: string) {
  const res = await fetch(
    `${BASE}/users/${username}/repos?sort=updated&per_page=100`
  );

  if (!res.ok) {
    throw new Error("Repositories not found");
  }

  return res.json();
}