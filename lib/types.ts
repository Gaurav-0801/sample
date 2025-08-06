export interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  imageUrl?: string
  isImage?: boolean
}

export interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

export interface SendMessageResponse {
  response: string
  imageUrl?: string
}
