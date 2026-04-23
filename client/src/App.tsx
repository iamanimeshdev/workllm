import { useState, useRef, useEffect } from 'react'
import { Brain, Sparkles, AlertCircle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatInput } from '@/components/ChatInput'
import { MessageBubble } from '@/components/MessageBubble'
import { ActionCard } from '@/components/ActionCard'
import { MemoryPanel } from '@/components/MemoryPanel'
import { ExampleChips } from '@/components/ExampleChips'

// ── Types ──────────────────────────────────────────────
interface Step {
  iteration: number
  tool: string
  confidence: number
  args: Record<string, unknown>
  missing_fields: string[]
  follow_up_question: string | null
  status: 'executed' | 'needs_input' | 'error'
  result: string | null
}

interface AIResponse {
  type: 'success' | 'follow_up' | 'error'
  message: string
  steps: Step[]
  total_iterations: number
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: AIResponse
  timestamp: Date
}

// ── Main App ───────────────────────────────────────────
function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMemory, setShowMemory] = useState(false)
  const [memoryRefreshKey, setMemoryRefreshKey] = useState(0)
  const [isWakingUp, setIsWakingUp] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

  // ── Wake-up check (Render cold starts) ──
  useEffect(() => {
    const checkHealth = async () => {
      const timeout = setTimeout(() => setIsWakingUp(true), 1500)
      try {
        const res = await fetch(`${API_BASE}/api/health`)
        if (res.ok) {
          clearTimeout(timeout)
          setIsWakingUp(false)
        }
      } catch (err) {
        // Server might be down or waking up
      }
    }
    checkHealth()
  }, [API_BASE])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  useEffect(scrollToBottom, [messages])

  // Build conversation history from messages (for context)
  const buildConversationHistory = () => {
    return messages.map(msg => ({
      role: msg.role,
      content: msg.role === 'user'
        ? msg.content
        : msg.response?.message || msg.content,
    }))
  }

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const conversationHistory = buildConversationHistory()

      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Unknown error' }))
        throw new Error(errData.message || `HTTP ${res.status}`)
      }

      const data: AIResponse = await res.json()

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        response: data,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])

      // Refresh memory panel if a memory tool was used
      if (data.steps?.some(s => s.tool === 'store_memory' || s.tool === 'recall_memory')) {
        setMemoryRefreshKey(prev => prev + 1)
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMsg)

      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errorMsg}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ── Header ── */}
      <header className="shrink-0 border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center shadow-sm overflow-hidden">
              <img src="https://workllm.io/wp-content/uploads/2026/01/fav-Icon-Color.svg" alt="WorkLLM" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-bold">WorkLLM</h1>
              <p className="text-[10px] text-muted-foreground">
                Email • Calendar • Memory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="gap-1.5 text-muted-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </Button>
            )}
            <Button
              variant={showMemory ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMemory(!showMemory)}
              className="gap-1.5"
            >
              <Brain className="h-3.5 w-3.5" />
              Memory
            </Button>
          </div>
        </div>
      </header>

      {/* ── Wake-up notification ── */}
      {isWakingUp && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[10px] font-medium text-amber-400 uppercase tracking-wider">
            Render is waking up the server... Please wait a moment.
          </span>
        </div>
      )}

      {/* ── Chat area ── */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <ExampleChips onSelect={handleSendMessage} />
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className="space-y-3">
                  {/* Text bubble */}
                  <MessageBubble role={msg.role} content={msg.content} />

                  {/* Tool execution steps (only for assistant messages with response data) */}
                  {msg.role === 'assistant' && msg.response && msg.response.steps.filter(s => s.tool !== 'final_answer').length > 0 && (
                    <div className="space-y-2">
                      {msg.response.steps.filter(s => s.tool !== 'final_answer').map((step, i) => (
                        <ActionCard key={`${msg.id}-step-${i}`} step={step} index={i} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Global error banner */}
              {error && (
                <div className="flex gap-3 justify-start animate-fade-in-up">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-md">
                    <AlertCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-red-500/10 border border-red-500/20 text-red-400 rounded-bl-sm">
                    {error}
                  </div>
                </div>
              )}

              {/* Loading / thinking indicator */}
              {loading && (
                <div className="flex gap-3 animate-fade-in-up">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">Processing with LLM...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* ── Input ── */}
      <ChatInput onSend={handleSendMessage} disabled={loading} />

      {/* ── Memory panel (slide-over) ── */}
      {showMemory && (
        <MemoryPanel
          apiBase={API_BASE}
          refreshKey={memoryRefreshKey}
          onClose={() => setShowMemory(false)}
        />
      )}
    </div>
  )
}

export default App
