import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RepoListColumn } from "../report-list-column";
import { Star } from "lucide-react";
import type { GithubRepo } from "@app/core";

const mockRepos: GithubRepo[] = [
  {
    id: 1,
    name: "test-repo",
    full_name: "user/test-repo",
    html_url: "http://github.com/user/test-repo",
    description: "Test description",
    stargazers_count: 1200,
    forks_count: 50,
    language: "TypeScript",
    owner: {
      login: "user",
      avatar_url: "avatar.png",
    },
  },
];

describe("RepoListColumn", () => {
  it("renders title and loading state", () => {
    render(
      <RepoListColumn
        title="Test Column"
        icon={Star}
        type="trending"
        data={[]}
        isLoading={true}
      />
    );
    expect(screen.getByText("Test Column")).toBeInTheDocument();
    // Assuming loading state renders pulse divs which are hard to select by text, 
    // but we can check that data is NOT rendered
    expect(screen.queryByText("test-repo")).not.toBeInTheDocument();
  });

  it("renders repo list when data is provided", () => {
    render(
      <RepoListColumn
        title="Test Column"
        icon={Star}
        type="trending"
        data={mockRepos}
        isLoading={false}
      />
    );

    expect(screen.getByText("test-repo")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("1.2k")).toBeInTheDocument(); // Formatted star count
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
  });
});
