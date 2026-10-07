// Mock dashboard card shown in the landing page hero section

const topics = [
  { name: 'Arrays',       pct: 92, color: 'bg-brand-500'  },
  { name: 'Linked Lists', pct: 74, color: 'bg-violet-500' },
  { name: 'Trees',        pct: 58, color: 'bg-amber-500'  },
  { name: 'Graphs',       pct: 38, color: 'bg-rose-400'   },
]

const recommended = [
  { label: 'Graph Algorithms',   reason: 'Based on your progress in Trees' },
  { label: 'Shortest Path (BFS)', reason: 'Adaptive recommendation'        },
]

export default function HeroDashboardPreview() {
  return (
    <div className="relative w-full max-w-[480px] mx-auto select-none">
      {/* Main card */}
      <div className="bg-white border border-navy-200 rounded-2xl shadow-card-lg overflow-hidden">
        {/* Card header */}
        <div className="px-6 py-4 border-b border-navy-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-navy-400 font-medium">Welcome back,</p>
            <p className="text-sm font-bold text-navy-900">Aditya 👋</p>
          </div>
          <span className="text-xs bg-brand-50 text-brand-600 border border-brand-100 rounded-full px-2.5 py-1 font-semibold">
            DSA · Undergraduate
          </span>
        </div>

        {/* Overall progress */}
        <div className="px-6 py-4 border-b border-navy-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-navy-600">Overall Progress</span>
            <span className="text-xs font-bold text-brand-600">72%</span>
          </div>
          <div className="h-2 bg-navy-100 rounded-full overflow-hidden">
            <div className="h-full w-[72%] bg-gradient-to-r from-brand-500 to-violet-500 rounded-full" />
          </div>
        </div>

        {/* Topic breakdown */}
        <div className="px-6 py-4 border-b border-navy-100">
          <p className="text-xs font-semibold text-navy-600 mb-3">Topic Mastery</p>
          <div className="space-y-2.5">
            {topics.map(t => (
              <div key={t.name} className="flex items-center gap-3">
                <span className="text-xs text-navy-600 w-24 flex-shrink-0">{t.name}</span>
                <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${t.color}`}
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-navy-700 w-8 text-right">{t.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended */}
        <div className="px-6 py-4">
          <p className="text-xs font-semibold text-navy-600 mb-3">Recommended for you</p>
          <div className="space-y-2">
            {recommended.map(r => (
              <div
                key={r.label}
                className="flex items-center justify-between p-3 bg-navy-50 rounded-xl border border-navy-100"
              >
                <div>
                  <p className="text-xs font-semibold text-navy-800">{r.label}</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">{r.reason}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating personalization pill — top left */}
      <div className="absolute -top-4 -left-4 bg-white border border-navy-200 rounded-xl shadow-card-md px-3 py-2 flex items-center gap-2">
        <span className="text-base">🎯</span>
        <div>
          <p className="text-[10px] font-bold text-navy-800 leading-tight">Personalized</p>
          <p className="text-[10px] text-navy-400">Railway examples</p>
        </div>
      </div>

      {/* Floating mastery pill — bottom right */}
      <div className="absolute -bottom-4 -right-4 bg-white border border-navy-200 rounded-xl shadow-card-md px-3 py-2 flex items-center gap-2">
        <span className="text-base">🏆</span>
        <div>
          <p className="text-[10px] font-bold text-navy-800 leading-tight">Mastery: 85%</p>
          <p className="text-[10px] text-navy-400">Certificate ready</p>
        </div>
      </div>
    </div>
  )
}
