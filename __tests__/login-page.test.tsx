import { render, screen } from "@testing-library/react"
import LoginPage from "@/components/login-page"

describe("LoginPage", () => {
  it("renders login page with correct elements", () => {
    render(<LoginPage />)

    expect(screen.getByText("ChatGPT Clone")).toBeInTheDocument()
    expect(screen.getByText("Sign in to start chatting and generating images with AI")).toBeInTheDocument()
    expect(screen.getByText("Sign In with Auth0")).toBeInTheDocument()
    expect(screen.getByText("Text Chat")).toBeInTheDocument()
    expect(screen.getByText("Image Generation")).toBeInTheDocument()
  })

  it("has correct login link", () => {
    render(<LoginPage />)

    const loginButton = screen.getByRole("link", { name: /sign in with auth0/i })
    expect(loginButton).toHaveAttribute("href", "/api/auth/login")
  })
})
