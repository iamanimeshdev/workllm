import { useEffect, useState } from 'react'
import { Brain, Trash2, X, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface Memory { key: string; value: string; created_at: string }
interface MemoryPanelProps { apiBase: string; refreshKey: number; onClose: () => void }

export function MemoryPanel({ apiBase, refreshKey, onClose }: MemoryPanelProps) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMemories = async () => {
    try {
      const res = await fetch(`${apiBase}/api/memory`)
      const data = await res.json()
      setMemories(data.memories || [])
    } catch (e) { console.error('Failed to fetch memories:', e) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMemories() }, [refreshKey, apiBase])

  const clearAll = async () => {
    try { 
      await fetch(`${apiBase}/api/memory`, { method: 'DELETE' }); 
      setMemories([]) 
    } catch (e) { console.error('Failed to clear:', e) }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-card/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in-right">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <h3 className="font-semibold text-sm">Memory Store</h3>
          <Badge variant="secondary" className="text-[10px]">{memories.length}</Badge>
        </div>
        <div className="flex items-center gap-1">
          {memories.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearAll} className="h-7 w-7 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 text-muted-foreground">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 rounded-lg animate-shimmer" />)}</div>
          ) : memories.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No memories saved yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Ask me to remember something!</p>
            </div>
          ) : memories.map((mem, i) => (
            <div key={`${mem.key}-${i}`} className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-1.5">
              <span className="text-xs font-semibold text-foreground">{mem.key}</span>
              <p className="text-xs text-muted-foreground">{mem.value}</p>
              <p className="text-[10px] text-muted-foreground/50">{new Date(mem.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="px-4 py-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground/50 text-center">In-memory store • Resets on server restart</p>
      </div>
    </div>
  )
}
