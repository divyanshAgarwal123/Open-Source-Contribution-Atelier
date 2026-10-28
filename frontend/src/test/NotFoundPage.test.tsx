import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NotFoundPage } from "../pages/NotFoundPage";

const search = vi.fn();
const clearSearch = vi.fn();
let searchResults: { id: number; title: string; description: string }[] = [];
let lessonResults: { slug: string; title: string; description: string }[] = [];
vi.mock("../hooks/useAdvancedSearch", () => ({
  useAdvancedSearch: () => ({
    results: searchResults,
    loading: false,
    error: null,
    search,
    clearSearch,
  }),
}));
vi.mock("../hooks/useLessonSearch", () => ({
  useLessonSearch: () => ({ search: () => lessonResults, loading: false }),
}));

describe("NotFoundPage edge cases and rendering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchResults = [];
    lessonResults = [];
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the missing route indicator", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    const indicator = screen.getByText("ROUTE MISSING");
    expect(indicator).toBeInTheDocument();
  });

  it("should render the 404 main message", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    const heading = screen.getByText("This corridor doesn't exist.");
    expect(heading).toBeInTheDocument();
  });

  it("should provide a link back to the home page", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", { name: /Back to Home/i });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/");
  });

  it("suggests searches from the broken path and searches on submit", () => {
    render(
      <MemoryRouter initialEntries={["/lessons/git-branching/unknown-page"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(search).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "branching" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "unknown page" }));
    expect(search).toHaveBeenCalledWith("unknown page");
    const input = screen.getByRole("searchbox", {
      name: "Search lessons and resources",
    });
    fireEvent.change(input, { target: { value: "pull requests" } });
    fireEvent.submit(input.closest("form")!);
    expect(search).toHaveBeenCalledWith("pull requests");
    expect(
      screen.getByRole("link", { name: "Browse lessons" }),
    ).toHaveAttribute("href", "/learning-path");
    expect(screen.getByRole("link", { name: "Browse docs" })).toHaveAttribute(
      "href",
      "/documentation",
    );
  });

  it("shows at most five compact search results", () => {
    searchResults = Array.from({ length: 6 }, (_, index) => ({
      id: index,
      title: `Result ${index}`,
      description: "Relevant content",
    }));
    render(
      <MemoryRouter initialEntries={["/git"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Result 0")).toBeInTheDocument();
    expect(screen.getByText("Result 4")).toBeInTheDocument();
    expect(screen.queryByText("Result 5")).not.toBeInTheDocument();
  });

  it("links matching lessons to their actual page", () => {
    lessonResults = [
      {
        slug: "git-branches",
        title: "Git branches",
        description: "Learn branching",
      },
    ];
    render(
      <MemoryRouter initialEntries={["/git-branches/typo"]}>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Git branches" })).toHaveAttribute(
      "href",
      "/lessons/git-branches",
    );
  });
});
