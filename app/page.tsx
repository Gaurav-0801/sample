"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useUser } from "@auth0/nextjs-auth0/client"
import { trpc } from "@/lib/trpc-client"
import { useTheme } from "@/components/theme-provider"
import LoginPage from "@/components/login-page"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  imageUrl?: string
  isImage?: boolean
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export default function ChatPage() {
  const { user, isLoading: userLoading } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.imageUrl) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: data.response,
            role: "assistant",
            timestamp: new Date(),
            imageUrl: data.imageUrl,
            isImage: true,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            content: data.response,
            role: "assistant",
            timestamp: new Date(),
          },
        ])
      }
      setIsLoading(false)
      setIsGeneratingImage(false)
    },
    onError: () => {
      setIsLoading(false)
      setIsGeneratingImage(false)
    },
  })

  const createChat = trpc.chat.createChat.useMutation({
    onSuccess: (data) => {
      setCurrentChatId(data.id)
      setMessages([])
      setChats((prev) => [data, ...prev])
    },
  })

  const getChats = trpc.chat.getChats.useQuery(
    { userId: user?.sub || "" },
    { enabled: !!user?.sub }
  )

  useEffect(() => {
    if (getChats.data) {
      setChats(getChats.data)
    }
  }, [getChats.data])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const isImageRequest = (text: string): boolean => {
    const imageKeywords = [
      "generate image", "create image", "make image", "draw", "picture", 
      "photo", "illustration", "artwork", "visual", "sketch", "painting",
      "show me", "create a picture", "generate a picture", "make a drawing"
    ]
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || isGeneratingImage) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    
    const messageContent = input.trim()
    const isImageGen = isImageRequest(messageContent)
    
    if (isImageGen) {
      setIsGeneratingImage(true)
    } else {
      setIsLoading(true)
    }

    setInput("")

    if (!currentChatId) {
      await createChat.mutateAsync({
        title: messageContent.slice(0, 50) + (messageContent.length > 50 ? "..." : ""),
        userId: user?.sub || "",
      })
    }

    sendMessage.mutate({
      message: messageContent,
      chatId: currentChatId || "",
      history: messages,
      userId: user?.sub || "",
      isImageRequest: isImageGen,
    })
  }

  const startNewChat = () => {
    setCurrentChatId(null)
    setMessages([])
    setSidebarOpen(false)
  }

  const selectChat = (chat: Chat) => {
    setCurrentChatId(chat.id)
    setMessages(chat.messages)
    setSidebarOpen(false)
  }

  if (userLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="chat-container">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "show" : ""}`}>
        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {user.picture ? (
              <img src={user.picture || "/placeholder.svg"} alt="Profile" className="w-100 h-100 rounded-circle" />
            ) : (
              user.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="user-info flex-grow-1">
            <h6>{user.name}</h6>
            <small>{user.email}</small>
          </div>
          <a href="/api/auth/logout" className="logout-btn">
            <i className="bi bi-box-arrow-right"></i>
          </a>
        </div>

        {/* Sidebar Header */}
        <div className="sidebar-header">
          <button className="btn new-chat-btn w-100 mb-3" onClick={startNewChat}>
            <i className="bi bi-plus-lg me-2"></i>
            New Chat
          </button>
          <button className="btn theme-toggle-btn w-100" onClick={toggleTheme}>
            <i className={`bi bi-${theme === "dark" ? "sun" : "moon"} me-2`}></i>
            {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-grow-1">
          <div className="p-3">
            <h6 className="text-muted mb-3">Recent Chats</h6>
          </div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${currentChatId === chat.id ? "active" : ""}`}
              onClick={() => selectChat(chat)}
            >
              <div className="chat-item-title">{chat.title}</div>
              <div className="chat-item-meta">{chat.messages.length} messages</div>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="chat-header d-flex align-items-center justify-content-between p-3">
        <button className="btn btn-outline-secondary" onClick={() => setSidebarOpen(true)}>
          <i className="bi bi-list"></i>
        </button>
        <h5 className="mb-0 fw-bold">ChatGPT Clone</h5>
        <button className="btn btn-outline-secondary" onClick={toggleTheme}>
          <i className={`bi bi-${theme === "dark" ? "sun" : "moon"}`}></i>
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-section">
            <h1 className="welcome-title">Welcome to ChatGPT Clone</h1>
            <p className="welcome-subtitle">
              I can help you with text responses and generate images. Just ask!
            </p>
            
            <div className="feature-cards">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-chat-dots"></i>
                </div>
                <h6>Text Conversations</h6>
                <p className="mb-0 small text-muted">Ask me anything and I'll provide detailed responses</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="bi bi-image"></i>
                </div>
                <h6>Image Generation</h6>
                <p className="mb-0 small text-muted">Request images and I'll create them for you</p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`message-bubble ${message.role === "user" ? "user-message" : "assistant-message"}`}
          >
            {message.content}
            {message.imageUrl && (
              <img 
                src={message.imageUrl || "/placeholder.svg"} 
                alt="Generated image" 
                className="message-image"
              />
            )}
          </div>
        ))}

        {isGeneratingImage && (
          <div className="image-generation-indicator">
            <div className="image-loading">
              <div className="image-loading-spinner"></div>
              <span>Generating your image...</span>
            </div>
          </div>
        )}

        {isLoading && !isGeneratingImage && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            <span className="ms-2 text-muted">AI is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input-container">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            className="form-control chat-input"
            placeholder="Type your message or ask for an image..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || isGeneratingImage}
          />
          <button 
            className="chat-send-btn" 
            type="submit" 
            disabled={isLoading || isGeneratingImage || !input.trim()}
          >
            {isLoading || isGeneratingImage ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i className="bi bi-send"></i>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
