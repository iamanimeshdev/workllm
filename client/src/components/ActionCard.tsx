import {
  Mail,
  FileEdit,
  CalendarPlus,
  Brain,
  Search,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Gauge,
  AlertCircle,
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

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

interface ActionCardProps {
  step: Step
  index: number
}

// ── Tool visual config ─────────────────────────────────
const toolConfig: Record<string, { icon: typeof Mail; label: string; color: string; gradient: string }> = {
  send_email: {
    icon: Mail,
    label: 'Send Email',
    color: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/10',
  },
  draft_email: {
    icon: FileEdit,
    label: 'Draft Email',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },
  schedule_meeting: {
    icon: CalendarPlus,
    label: 'Schedule Meeting',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-amber-600/10',
  },
  store_memory: {
    icon: Brain,
    label: 'Store Memory',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/10',
  },
  recall_memory: {
    icon: Search,
    label: 'Recall Memory',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-cyan-600/10',
  },
  error: {
    icon: AlertCircle,
    label: 'Error',
    color: 'text-red-400',
    gradient: 'from-red-500/20 to-red-600/10',
  },
}

// ── Confidence bar component ───────────────────────────
function ConfidenceBar({ value }: { value: number }) {
  const percent = Math.round(value * 100)
  const color =
    percent >= 80 ? 'bg-emerald-500' :
    percent >= 50 ? 'bg-amber-500' :
    'bg-red-500'

  return (
    <div className="flex items-center gap-2">
      <Gauge className="h-3 w-3 text-muted-foreground" />
      <div className="flex-1 h-1.5 bg-background/50 rounded-full overflow-hidden max-w-[80px]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground font-mono">{percent}%</span>
    </div>
  )
}

// ── Main ActionCard ────────────────────────────────────
export function ActionCard({ step, index }: ActionCardProps) {
  const [showRaw, setShowRaw] = useState(false)
  const config = toolConfig[step.tool] || toolConfig.error
  const Icon = config.icon

  const statusIcon =
    step.status === 'executed' ? (
      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
    ) : step.status === 'needs_input' ? (
      <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
    ) : (
      <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
    )

  const statusLabel =
    step.status === 'executed' ? 'executed' :
    step.status === 'needs_input' ? 'needs input' :
    'error'

  const statusVariant =
    step.status === 'executed' ? 'success' as const :
    step.status === 'needs_input' ? 'warning' as const :
    'destructive' as const

  return (
    <div className={`ml-11 rounded-xl border border-border/50 bg-gradient-to-r ${config.gradient} p-4 animate-fade-in-up shadow-sm`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md bg-background/50 ${config.color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-semibold text-sm">{config.label}</span>
          <span className="text-xs text-muted-foreground">#{index + 1}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {statusIcon}
          <Badge variant={statusVariant} className="text-[10px] px-1.5 py-0">
            {statusLabel}
          </Badge>
        </div>
      </div>

      {/* Confidence bar */}
      {step.confidence > 0 && (
        <div className="mb-3">
          <ConfidenceBar value={step.confidence} />
        </div>
      )}

      {/* Args — pretty-printed */}
      {Object.keys(step.args || {}).length > 0 && (
        <div className="space-y-1.5 bg-background/30 rounded-lg p-3 mb-3">
          {Object.entries(step.args).map(([key, value]) => {
            const isMissing = step.missing_fields.includes(key)
            return (
              <div key={key} className="flex gap-2 text-xs">
                <span className={`font-mono min-w-[120px] shrink-0 ${isMissing ? 'text-red-400' : 'text-muted-foreground'}`}>
                  {isMissing && '⚠ '}{key}:
                </span>
                <span className={`break-words font-medium ${isMissing ? 'text-red-400 italic' : 'text-foreground'}`}>
                  {Array.isArray(value)
                    ? (value.length > 0 ? value.join(', ') : '(empty)')
                    : (String(value) || '(empty)')}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Missing fields highlight */}
      {step.missing_fields.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {step.missing_fields.map((field) => (
            <span
              key={field}
              className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 font-medium"
            >
              ⚠ {field}
            </span>
          ))}
        </div>
      )}

      {/* Execution result */}
      {step.status === 'executed' && step.result && (
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-emerald-400/90 leading-relaxed font-medium whitespace-pre-wrap">
            ✓ {step.result}
          </p>
        </div>
      )}

      {/* Follow-up question */}
      {step.follow_up_question && (
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-amber-400/90 leading-relaxed font-medium">
            💬 {step.follow_up_question}
          </p>
        </div>
      )}

      {/* Error result */}
      {step.status === 'error' && step.result && (
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-red-400/90 leading-relaxed font-medium">
            ✗ {step.result}
          </p>
        </div>
      )}

      {/* Raw JSON toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowRaw(!showRaw)}
        className="mt-2 h-6 text-[10px] text-muted-foreground px-2 -ml-2"
      >
        {showRaw ? <ChevronUp className="h-3 w-3 mr-1" /> : <ChevronDown className="h-3 w-3 mr-1" />}
        {showRaw ? 'Hide' : 'Show'} raw JSON
      </Button>
      {showRaw && (
        <pre className="mt-2 text-[10px] bg-background/50 rounded-md p-3 overflow-x-auto text-muted-foreground font-mono whitespace-pre-wrap">
          {JSON.stringify(step, null, 2)}
        </pre>
      )}
    </div>
  )
}
