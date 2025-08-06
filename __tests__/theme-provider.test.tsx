"use client"

import { render, screen, fireEvent } from "@testing-library/react"
import { ThemeProvider, useTheme } from "@/components/theme-provider"
import jest from "jest" // Import jest to fix the undeclared variable error

const TestComponent = () => {
  const { theme, toggleTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear()
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  })

  it("defaults to light theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    expect(screen.getByTestId("theme")).toHaveTextContent("light")
  })

  it("toggles theme when button is clicked", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>,
    )

    const toggleButton = screen.getByText("Toggle Theme")
    const themeDisplay = screen.getByTestId("theme")

    expect(themeDisplay).toHaveTextContent("light")

    fireEvent.click(toggleButton)
    expect(themeDisplay).toHaveTextContent("dark")

    fireEvent.click(toggleButton)
    expect(themeDisplay).toHaveTextContent("light")
  })
})
