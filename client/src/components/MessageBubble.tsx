import { User, Bot } from 'lucide-react'

interface MessageBubbleProps {
  role: 'user' | 'assistant'
  content: string
}

export function MessageBubble({ role, content }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <div
      className={`flex gap-3 animate-fade-in-up ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-md">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-br-sm'
            : 'bg-card border border-border text-card-foreground rounded-bl-sm'
        }`}
      >
        <span className="whitespace-pre-wrap">{content}</span>
      </div>
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </div>
  )
}
