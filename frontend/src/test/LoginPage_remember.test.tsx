import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginPage } from "../pages/LoginPage";
import { ThemeProvider } from "../context/ThemeContext";
import { fetchApi } from "../lib/api";

vi.mock("../lib/api", () => ({ fetchApi: vi.fn() }));

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));

vi.mock("../features/auth/DemoLoginButton", () => ({
  DemoLoginButton: () => <button>Demo Login</button>,
}));

vi.mock("@react-oauth/google", () => ({
  useGoogleLogin: () => vi.fn(),
}));

vi.mock("../features/auth/AuthContext", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

describe("LoginPage Remember Me option", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("renders 'Remember me for 30 days' checkbox and allows toggling state", () => {
    render(
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>,
    );

    const checkbox = screen.getByLabelText(/remember me for 30 days/i);
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("shows and clears an inline error for an empty email without sending a request", () => {
    render(
      <ThemeProvider>
        <LoginPage />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "example-password" },
    });
    fireEvent.submit(
      screen.getByRole("button", { name: /let me in/i }).closest("form")!,
    );

    const username = screen.getByLabelText("Username or email");
    expect(screen.getByRole("alert")).toHaveTextContent("Email is required");
    expect(username).toHaveAttribute("aria-invalid", "true");
    expect(username).toHaveAttribute("aria-describedby", "username-error");
    expect(username).toHaveClass("border-rose-500");
    expect(fetchApi).not.toHaveBeenCalled();

    fireEvent.change(username, { target: { value: "person@example.com" } });
    expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    expect(username).toHaveAttribute("aria-invalid", "false");
  });
});
