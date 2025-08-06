import type React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { UserProvider } from "@auth0/nextjs-auth0/client"
import ChatPage from "@/app/page"
import { ThemeProvider } from "@/components/theme-provider"

// Mock Auth0
const mockUser = {
  sub: "auth0|123",
  name: "Test User",
  email: "test@example.com",
  picture: "https://example.com/avatar.jpg",
}

jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: () => ({
    user: mockUser,
    isLoading: false,
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

// Mock tRPC
jest.mock("@/lib/trpc-client", () => ({
  trpc: {
    chat: {
      sendMessage: {
        useMutation: () => ({
          mutate: jest.fn(),
          isLoading: false,
        }),
      },
      createChat: {
        useMutation: () => ({
          mutateAsync: jest.fn(),
        }),
      },
      getChats: {
        useQuery: () => ({
          data: [],
        }),
      },
    },
  },
}))

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>{component}</ThemeProvider>
      </QueryClientProvider>
    </UserProvider>,
  )
}

describe("ChatPage", () => {
  it("renders welcome message when no messages", () => {
    renderWithProviders(<ChatPage />)

    expect(screen.getByText("Welcome to ChatGPT Clone")).toBeInTheDocument()
    expect(screen.getByText("I can help you with text responses and generate images. Just ask!")).toBeInTheDocument()
  })

  it("renders input field and send button", () => {
    renderWithProviders(<ChatPage />)

    expect(screen.getByPlaceholderText("Type your message or ask for an image...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "" })).toBeInTheDocument()
  })

  it("renders feature cards", () => {
    renderWithProviders(<ChatPage />)

    expect(screen.getByText("Text Conversations")).toBeInTheDocument()
    expect(screen.getByText("Image Generation")).toBeInTheDocument()
  })

  it("renders user profile in sidebar", () => {
    renderWithProviders(<ChatPage />)

    // Open sidebar
    const sidebarToggle = screen.getAllByRole("button")[0]
    fireEvent.click(sidebarToggle)

    expect(screen.getByText("Test User")).toBeInTheDocument()
    expect(screen.getByText("test@example.com")).toBeInTheDocument()
  })
})
