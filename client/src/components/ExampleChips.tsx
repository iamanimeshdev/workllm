import {
  Mail,
  Calendar,
  FileEdit,
  Brain,
  Clock,
  Users,
} from 'lucide-react'

interface ExampleChipsProps {
  onSelect: (text: string) => void
}

const examples = [
  {
    icon: Mail,
    text: 'Send an email to Rahul saying I will be late tomorrow',
    color: 'from-blue-500/20 to-blue-600/10 hover:from-blue-500/30',
  },
  {
    icon: Calendar,
    text: 'Schedule a 30 min meeting with Priya next Tuesday afternoon',
    color: 'from-amber-500/20 to-amber-600/10 hover:from-amber-500/30',
  },
  {
    icon: FileEdit,
    text: 'Draft an email to the design team about Friday\'s release',
    color: 'from-emerald-500/20 to-emerald-600/10 hover:from-emerald-500/30',
  },
  {
    icon: Brain,
    text: 'Remember that Rahul\'s email is rahul@company.com',
    color: 'from-purple-500/20 to-purple-600/10 hover:from-purple-500/30',
  },
  {
    icon: Clock,
    text: 'Find a 30 minute slot with Rahul and Priya tomorrow',
    color: 'from-cyan-500/20 to-cyan-600/10 hover:from-cyan-500/30',
  },
  {
    icon: Users,
    text: 'Email engineering managers about the production issue and schedule a war room',
    color: 'from-rose-500/20 to-rose-600/10 hover:from-rose-500/30',
  },
]

export function ExampleChips({ onSelect }: ExampleChipsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-4">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20 animate-pulse-glow">
          <Mail className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
          AI Email & Calendar Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          I can send emails, schedule meetings, and remember things for you.
          Try one of these examples or type your own request.
        </p>
      </div>

      {/* Example chips grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full">
        {examples.map((example, i) => {
          const Icon = example.icon
          return (
            <button
              key={i}
              onClick={() => onSelect(example.text)}
              className={`flex items-start gap-3 text-left rounded-xl border border-border/50 bg-gradient-to-r ${example.color} px-4 py-3 transition-all hover:scale-[1.02] hover:border-border cursor-pointer group`}
            >
              <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-0.5 transition-colors" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                {example.text}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
