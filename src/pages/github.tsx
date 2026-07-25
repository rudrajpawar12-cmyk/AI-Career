import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layouts";
import {
  Github as GitIcon,
  GitCommit,
  Star,
  GitFork,
  Activity,
  ExternalLink,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

import { useProfile } from "@/hooks/useProfile";
import {
  getGithubProfile,
  getGithubRepos,
} from "@/services/github.service";

import type {
  GithubProfile,
  GithubRepo,
} from "@/types/github";
const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  C: "#555555",
  "C++": "#f34b7d",
  Dart: "#00B4AB",
  Go: "#00ADD8",
  Rust: "#dea584",
  Kotlin: "#A97BFF",
};

export default function GithubAnalyzer() {
  const { profile } = useProfile();

  const githubUsername = profile?.github_username ?? "";

  const [githubProfile, setGithubProfile] =
    useState<GithubProfile | null>(null);

  const [repos, setRepos] =
    useState<GithubRepo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");
      useEffect(() => {
    if (!githubUsername) {
      setLoading(false);
      return;
    }

    async function loadGithub() {
      try {
        setLoading(true);

        const profileData =
          await getGithubProfile(githubUsername);

        const repoData =
          await getGithubRepos(githubUsername);

        setGithubProfile(profileData);
        setRepos(repoData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load GitHub profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadGithub();
  }, [githubUsername]);
    const totalStars = useMemo(
    () =>
      repos.reduce(
        (sum, repo) => sum + repo.stargazers_count,
        0
      ),
    [repos]
  );

  const totalForks = useMemo(
    () =>
      repos.reduce(
        (sum, repo) => sum + repo.forks_count,
        0
      ),
    [repos]
  );

  const languageData = useMemo(() => {
    const map = new Map<string, number>();

    repos.forEach((repo) => {
      if (!repo.language) return;

      map.set(
        repo.language,
        (map.get(repo.language) || 0) + 1
      );
    });

    return [...map.entries()]
      .map(([name, value]) => ({
        name,
        value,
        color:
          languageColors[name] ??
          "#8b949e",
      }))
      .sort((a, b) => b.value - a.value);
  }, [repos]);

  const topRepos = useMemo(
    () =>
      [...repos]
        .sort(
          (a, b) =>
            b.stargazers_count -
            a.stargazers_count
        )
        .slice(0, 6),
    [repos]
  );
    if (loading) {
    return (
      <AppLayout>
        <div className="p-10 text-center">
          Loading GitHub Profile...
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="p-10 text-center text-red-500">
          {error}
        </div>
      </AppLayout>
    );
  }
    return (
    <AppLayout>
      <div className="space-y-8">

        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">

            <img
              src={githubProfile?.avatar_url}
              alt="avatar"
              className="w-16 h-16 rounded-2xl border border-white/10"
            />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">
                  {githubProfile?.name || githubProfile?.login}
                </h1>

                <a
                  href={githubProfile?.html_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </a>
              </div>

              <p className="text-muted-foreground mt-2">
                {githubProfile?.bio}
              </p>

              <div className="flex gap-6 mt-3 text-sm text-muted-foreground">
                <span>
                  Followers <strong>{githubProfile?.followers}</strong>
                </span>

                <span>
                  Following <strong>{githubProfile?.following}</strong>
                </span>

                <span>
                  Repositories <strong>{githubProfile?.public_repos}</strong>
                </span>
              </div>
            </div>

          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              GitHub Score
            </div>

            <div className="text-4xl font-bold text-green-400">
  {Math.min(
    100,
    Math.round(
      repos.length * 2 +
      totalStars * 0.8 +
      (githubProfile?.followers ?? 0) * 0.5
    )
  )}
</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <GitCommit className="w-4 h-4" />
              Repositories
            </div>

            <div className="text-3xl font-bold">
              {repos.length}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Star className="w-4 h-4" />
              Stars
            </div>

            <div className="text-3xl font-bold">
              {totalStars}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <GitFork className="w-4 h-4" />
              Forks
            </div>

            <div className="text-3xl font-bold">
              {totalForks}
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Users className="w-4 h-4" />
              Followers
            </div>

            <div className="text-3xl font-bold">
              {githubProfile?.followers}
            </div>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          <div className="glass-card rounded-3xl p-6">

            <h2 className="font-bold text-xl mb-6">
              Top Repositories
            </h2>

            <div className="space-y-4">

              {topRepos.map(repo => (

                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-4 rounded-2xl border border-white/5 hover:border-primary transition"
                >

                  <div className="flex justify-between">

                    <div>

                      <h3 className="font-semibold text-primary">
                        {repo.name}
                      </h3>

                      <p className="text-sm text-muted-foreground mt-1">
                        {repo.description}
                      </p>

                    </div>

                    <div className="text-right text-sm">

                      ⭐ {repo.stargazers_count}

                      <br />

                      🍴 {repo.forks_count}

                    </div>

                  </div>

                </a>

              ))}

            </div>

          </div>
                    <div className="glass-card rounded-3xl p-6">

            <h2 className="font-bold text-xl mb-6">
              Language Distribution
            </h2>

            <div className="h-72">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={languageData} layout="vertical">

                  <XAxis type="number" hide />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    radius={[0, 6, 6, 0]}
                  >

                    {languageData.map((lang) => (
                      <Cell
                        key={lang.name}
                        fill={lang.color}
                      />
                    ))}

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        <div className="glass-card rounded-3xl p-8">

          <h2 className="font-bold text-xl mb-6">
            GitHub Contribution Graph
          </h2>

          <img
            src={`https://ghchart.rshah.org/${githubUsername}`}
            alt="Contribution Graph"
            className="w-full rounded-xl bg-white"
          />

        </div>

        <div className="glass-card rounded-3xl p-8">

          <h2 className="font-bold text-xl mb-4">
            AI GitHub Review
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <h3 className="font-semibold text-green-400 mb-3">
                Strengths
              </h3>

              <ul className="space-y-2 list-disc pl-5 text-sm">

                <li>
                  {repos.length >= 10
                    ? "Good number of public repositories."
                    : "Add more public projects."}
                </li>

                <li>
                  {totalStars >= 20
                    ? "Repositories have community engagement."
                    : "Increase repository quality to gain stars."}
                </li>

                <li>
                  {languageData.length >= 3
                    ? "Uses multiple programming languages."
                    : "Explore more technologies."}
                </li>

              </ul>

            </div>

            <div>

              <h3 className="font-semibold text-orange-400 mb-3">
                Suggestions
              </h3>

              <ul className="space-y-2 list-disc pl-5 text-sm">

                <li>Add detailed README files.</li>

                <li>Pin your best repositories.</li>

                <li>Maintain a consistent commit streak.</li>

                <li>Contribute to open source projects.</li>

              </ul>

            </div>

          </div>

        </div>

      </div>

    </AppLayout>

  );
}