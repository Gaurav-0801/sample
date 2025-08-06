import { z } from "zod"
import { router, publicProcedure } from "../trpc"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { supabase } from "@/lib/supabase"

// Function to generate image using Fal AI
async function generateImage(prompt: string): Promise<string> {
  try {
    if (!process.env.FAL_KEY) {
      throw new Error("FAL_KEY not configured")
    }

    const response = await fetch("https://fal.run/fal-ai/flux/schnell", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.images?.[0]?.url || ""
  } catch (error) {
    console.error("Error generating image:", error)
    // Fallback to a placeholder image
    return `/placeholder.svg?height=512&width=512&text=${encodeURIComponent(prompt)}`
  }
}

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        message: z.string(),
        chatId: z.string(),
        userId: z.string(),
        isImageRequest: z.boolean().default(false),
        history: z.array(
          z.object({
            id: z.string(),
            content: z.string(),
            role: z.enum(["user", "assistant"]),
            timestamp: z.date(),
            imageUrl: z.string().optional(),
            isImage: z.boolean().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        if (input.isImageRequest) {
          // Generate image
          const imageUrl = await generateImage(input.message)
          const response = `I've generated an image based on your request: "${input.message}"`

          // Save messages to Supabase
          if (input.chatId) {
            await supabase.from("messages").insert([
              {
                chat_id: input.chatId,
                content: input.message,
                role: "user",
              },
              {
                chat_id: input.chatId,
                content: response,
                role: "assistant",
                image_url: imageUrl,
                is_image: true,
              },
            ])
          }

          return { response, imageUrl }
        } else {
          // Generate text response using OpenAI
          const messages = input.history
            .filter(msg => !msg.isImage)
            .map((msg) => ({
              role: msg.role,
              content: msg.content,
            }))

          messages.push({
            role: "user" as const,
            content: input.message,
          })

          const { text } = await generateText({
            model: openai("gpt-3.5-turbo"),
            messages,
            system: "You are a helpful AI assistant. Provide clear, concise, and helpful responses. If someone asks you to generate, create, make, or draw an image, politely let them know they should use specific image generation keywords like 'generate image of...' or 'create a picture of...'",
          })

          // Save messages to Supabase
          if (input.chatId) {
            await supabase.from("messages").insert([
              {
                chat_id: input.chatId,
                content: input.message,
                role: "user",
              },
              {
                chat_id: input.chatId,
                content: text,
                role: "assistant",
              },
            ])
          }

          return { response: text }
        }
      } catch (error) {
        console.error("Error generating response:", error)
        return { 
          response: input.isImageRequest 
            ? "Sorry, I couldn't generate the image. Please try again." 
            : "Sorry, I encountered an error. Please try again." 
        }
      }
    }),

  createChat: publicProcedure
    .input(
      z.object({
        title: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const { data, error } = await supabase
        .from("chats")
        .insert({
          title: input.title,
          user_id: input.userId,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        messages: [],
        createdAt: new Date(data.created_at),
      }
    }),

  getChats: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const { data: chats, error } = await supabase
        .from("chats")
        .select(`
          id,
          title,
          created_at,
          messages (
            id,
            content,
            role,
            image_url,
            is_image,
            created_at
          )
        `)
        .eq("user_id", input.userId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: new Date(chat.created_at),
        messages: chat.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
          imageUrl: msg.image_url,
          isImage: msg.is_image,
        })),
      }))
    }),
})
