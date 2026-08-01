import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Skill, CreateSkillInput } from '../models/Skill'
import type { PushupEntry } from '../models/PushupEntry'
import type { TreeViewMode } from '../hooks/useTreeSettings'
import { computeEntryPoints, roundTenth } from '../utils/stats'
import { AddSkillModal } from '../components/AddSkillModal'
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal'
import { QuickLogModal } from '../components/QuickLogModal'

interface SkillTreeScreenProps {
  skills: Skill[]
  entries: PushupEntry[]
  onAddSkill: (input: CreateSkillInput) => void
  onUpdateSkill?: (id: string, updates: Partial<Skill>) => void
  onDeleteSkill?: (id: string) => void
  onResetWorkspace?: () => void
  onAddEntry?: (amount: number, skillId?: string, skillName?: string) => void
  viewMode?: TreeViewMode
  onSetViewMode?: (mode: TreeViewMode) => void
}

const DOMAIN_COLORS: Record<string, { bg: string; border: string; text: string; dot: string; glow: string; stroke: string }> = {
  Push: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    dot: 'bg-amber-400',
    glow: 'rgba(251, 191, 36, 0.25)',
    stroke: '#f59e0b',
  },
  Pull: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/40',
    text: 'text-sky-400',
    dot: 'bg-sky-400',
    glow: 'rgba(56, 189, 248, 0.25)',
    stroke: '#0ea5e9',
  },
  Core: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400',
    glow: 'rgba(52, 211, 153, 0.25)',
    stroke: '#10b981',
  },
  Legs: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/40',
    text: 'text-rose-400',
    dot: 'bg-rose-400',
    glow: 'rgba(251, 113, 133, 0.25)',
    stroke: '#f43f5e',
  },
  Skill: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/40',
    text: 'text-purple-400',
    dot: 'bg-purple-400',
    glow: 'rgba(192, 132, 252, 0.25)',
    stroke: '#a855f7',
  },
}

interface NodePosition {
  x: number
  y: number
}

export function SkillTreeScreen({
  skills,
  entries,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onResetWorkspace,
  onAddEntry,
  viewMode = 'node-graph',
  onSetViewMode,
}: SkillTreeScreenProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [deletingSkill, setDeletingSkill] = useState<Skill | null>(null)
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [filterDomain, setFilterDomain] = useState<string>('all')
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false)

  const treeContainerRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [connections, setConnections] = useState<Array<{ from: NodePosition; to: NodePosition; stroke: string }>>([])

  const skillsMap = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills])

  const skillStats = useMemo(() => {
    const stats: Record<string, { reps: number; points: number }> = {}
    skills.forEach((s) => (stats[s.id] = { reps: 0, points: 0 }))
    entries.forEach((e) => {
      const sId = e.skillId || 'pushups'
      const pts = computeEntryPoints(e, skillsMap)
      if (!stats[sId]) stats[sId] = { reps: 0, points: 0 }
      stats[sId].reps += e.amount
      stats[sId].points = roundTenth(stats[sId].points + pts)
    })
    return stats
  }, [skills, entries, skillsMap])

  const filteredSkills = useMemo(() => {
    if (filterDomain === 'all') return skills
    return skills.filter((s) => s.domain.toLowerCase() === filterDomain.toLowerCase())
  }, [skills, filterDomain])

  const skillDepthMap = useMemo(() => {
    const depthMap = new Map<string, number>()

    const getDepth = (id: string, visited = new Set<string>()): number => {
      if (visited.has(id)) return 0
      visited.add(id)
      const skill = skillsMap.get(id)
      if (!skill || !skill.previousSkillId) return 0
      return 1 + getDepth(skill.previousSkillId, visited)
    }

    skills.forEach((s) => {
      depthMap.set(s.id, getDepth(s.id))
    })

    return depthMap
  }, [skills, skillsMap])

  const depthLevels = useMemo(() => {
    const levels: Map<number, Skill[]> = new Map()
    filteredSkills.forEach((s) => {
      const d = skillDepthMap.get(s.id) || 0
      if (!levels.has(d)) levels.set(d, [])
      levels.get(d)!.push(s)
    })
    const sortedDepths = Array.from(levels.keys()).sort((a, b) => a - b)
    return sortedDepths.map((d) => ({ depth: d, skills: levels.get(d)! }))
  }, [filteredSkills, skillDepthMap])

  const calculateConnections = () => {
    if (!treeContainerRef.current) return
    const containerRect = treeContainerRef.current.getBoundingClientRect()
    const newConns: Array<{ from: NodePosition; to: NodePosition; stroke: string }> = []

    skills.forEach((skill) => {
      if (skill.previousSkillId) {
        const parentNode = nodeRefs.current.get(skill.previousSkillId)
        const childNode = nodeRefs.current.get(skill.id)

        if (parentNode && childNode) {
          const parentRect = parentNode.getBoundingClientRect()
          const childRect = childNode.getBoundingClientRect()

          const from: NodePosition = {
            x: parentRect.left + parentRect.width / 2 - containerRect.left,
            y: parentRect.top + parentRect.height / 2 - containerRect.top,
          }
          const to: NodePosition = {
            x: childRect.left + childRect.width / 2 - containerRect.left,
            y: childRect.top + childRect.height / 2 - containerRect.top,
          }

          const stroke = DOMAIN_COLORS[skill.domain]?.stroke || '#a855f7'
          newConns.push({ from, to, stroke })
        }
      }
    })

    setConnections(newConns)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateConnections()
    }, 100)
    window.addEventListener('resize', calculateConnections)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', calculateConnections)
    }
  }, [filteredSkills, depthLevels, viewMode])

  const getDomainStyle = (domain: string) => {
    return (
      DOMAIN_COLORS[domain] || {
        bg: 'bg-indigo-500/10',
        border: 'border-indigo-500/30',
        text: 'text-indigo-400',
        dot: 'bg-indigo-400',
        glow: 'rgba(129, 140, 248, 0.2)',
        stroke: '#818cf8',
      }
    )
  }

  const selectedSkill = useMemo(
    () => skills.find((s) => s.id === selectedSkillId),
    [skills, selectedSkillId],
  )

  const formatPointsBadge = (skill: Skill) => {
    const pts = skill.pointsPerRep || 1
    if (skill.trackingType === 'time') {
      const unit = skill.timeUnitSeconds || 1
      return `${pts}pt/${unit}s`
    }
    return `${pts}x pts`
  }

  return (
    <div className="flex flex-col h-full px-3 sm:px-4 pt-safe pb-safe relative overflow-hidden">
      {/* Add / Edit Modal */}
      <AddSkillModal
        isOpen={isAddModalOpen || editingSkill !== null}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingSkill(null)
        }}
        skills={skills}
        onAddSkill={onAddSkill}
        editingSkill={editingSkill}
        onUpdateSkill={onUpdateSkill}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deletingSkill !== null}
        skillName={deletingSkill?.name || ''}
        onClose={() => setDeletingSkill(null)}
        onConfirm={() => {
          if (deletingSkill && onDeleteSkill) {
            onDeleteSkill(deletingSkill.id)
            if (selectedSkillId === deletingSkill.id) setSelectedSkillId(null)
          }
        }}
      />

      {/* Screen Header */}
      <header className="pt-4 sm:pt-6 pb-2 flex justify-between items-center z-10 shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Skill Tree</h2>
          <p className="text-[10px] sm:text-xs text-muted mt-0.5">Dynamic Calisthenics Workspace</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Toggle */}
          <div className="bg-surface border border-border/80 rounded-xl p-1 flex">
            <button
              onClick={() => onSetViewMode && onSetViewMode('node-graph')}
              title="Node Graph View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'node-graph'
                  ? 'bg-accent text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6" cy="6" r="3"></circle>
                <circle cx="18" cy="18" r="3"></circle>
                <line x1="8.5" y1="8.5" x2="15.5" y2="15.5"></line>
              </svg>
            </button>
            <button
              onClick={() => onSetViewMode && onSetViewMode('cards')}
              title="Detailed Cards View"
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards'
                  ? 'bg-accent text-background shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              </svg>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAddModalOpen(true)}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-accent text-background text-[11px] sm:text-xs font-bold shadow-lg shadow-accent/20 flex items-center gap-1 transition-all"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Node
          </motion.button>
        </div>
      </header>

      {/* Top Filter & Reset Toolbar */}
      <div className="flex justify-between items-center mb-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-[11px] font-semibold text-muted uppercase tracking-wider">Domain:</span>
          <select
            value={filterDomain}
            onChange={(e) => setFilterDomain(e.target.value)}
            className="bg-surface/80 border border-border/80 rounded-xl px-2 py-1 text-xs text-foreground font-medium focus:outline-none focus:border-accent"
          >
            <option value="all">All Domains (Points)</option>
            <option value="Push">Push</option>
            <option value="Pull">Pull</option>
            <option value="Core">Core</option>
            <option value="Legs">Legs</option>
            <option value="Skill">Skill</option>
          </select>
        </div>
        {onResetWorkspace && (
          <button
            onClick={onResetWorkspace}
            className="text-[9px] sm:text-[10px] font-semibold text-muted hover:text-foreground bg-surface border border-border/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full transition-colors"
          >
            Reset Workspace
          </button>
        )}
      </div>

      {/* Quick Log Floating Modal */}
      {onAddEntry && (
        <QuickLogModal
          isOpen={isQuickLogOpen}
          onClose={() => setIsQuickLogOpen(false)}
          skills={skills}
          defaultSkillId={selectedSkillId || undefined}
          onAdd={onAddEntry}
        />
      )}

      {/* Active View Canvas Container */}
      <div className="flex-1 overflow-y-auto pt-1 pb-20 space-y-4 scrollbar-none relative">
        {/* Selected Skill Action Card */}
        <AnimatePresence>
          {selectedSkill && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className="bg-surface border border-accent/60 rounded-2xl p-3.5 sm:p-4 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                    <h3 className="text-sm sm:text-base font-extrabold text-foreground">{selectedSkill.name}</h3>
                    <span className="text-[9px] sm:text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20">
                      {formatPointsBadge(selectedSkill)}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-muted mt-0.5">
                    Domain: {selectedSkill.domain} • Points:{' '}
                    <strong className="text-accent font-bold">
                      {(skillStats[selectedSkill.id]?.points || 0).toLocaleString()}
                    </strong>{' '}
                    ({(skillStats[selectedSkill.id]?.reps || 0).toLocaleString()} {selectedSkill.trackingType === 'time' ? 'secs' : 'reps'})
                  </p>
                </div>
                <button onClick={() => setSelectedSkillId(null)} className="p-1 text-muted hover:text-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-border/60">
                <button
                  onClick={() => setIsQuickLogOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-accent text-background font-bold text-xs shadow-md shadow-accent/20 flex items-center justify-center gap-1"
                >
                  ⚡ Quick Log {selectedSkill.name}
                </button>
                <button
                  onClick={() => setEditingSkill(selectedSkill)}
                  className="px-3 py-2 rounded-xl border border-border text-foreground text-xs font-semibold hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeletingSkill(selectedSkill)}
                  className="px-3 py-2 rounded-xl border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODE 1: NODE GRAPH VIEW WITH SVG CONNECTING LINES */}
        {viewMode === 'node-graph' ? (
          <div
            ref={treeContainerRef}
            className="bg-surface/30 border border-border/60 rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-md min-h-[480px] min-w-[320px] flex flex-col relative overflow-hidden"
          >
            {/* SVG Connecting Overlay Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {connections.map((conn, idx) => {
                const midY = (conn.from.y + conn.to.y) / 2
                const d = `M ${conn.from.x} ${conn.from.y} C ${conn.from.x} ${midY}, ${conn.to.x} ${midY}, ${conn.to.x} ${conn.to.y}`
                return (
                  <g key={idx}>
                    <path
                      d={d}
                      fill="none"
                      stroke={conn.stroke}
                      strokeWidth="2.5"
                      strokeOpacity="0.4"
                      strokeDasharray="4 2"
                    />
                  </g>
                )
              })}
            </svg>

            <div className="text-center mb-4 z-10">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted bg-background/80 px-2.5 py-0.5 rounded-full border border-border/40 shadow-sm">
                Dynamic Skill Tree (Connected Pathways)
              </span>
            </div>

            {/* Render 5 Layers from Level 0 (Bottom) to Level 4 (Top) */}
            <div className="flex flex-col-reverse justify-between gap-10 sm:gap-12 relative flex-1 z-10">
              {depthLevels.map(({ depth, skills: levelSkills }) => (
                <div key={depth} className="relative flex flex-col items-center">
                  <div className="text-[8.5px] sm:text-[9.5px] font-extrabold text-muted uppercase tracking-widest mb-2.5 bg-background/90 px-2.5 py-0.5 rounded-md border border-border/40 shadow-sm">
                    Layer {depth}
                  </div>

                  <div className="flex flex-wrap justify-center gap-2.5 sm:gap-5 w-full">
                    {levelSkills.map((skill) => {
                      const style = getDomainStyle(skill.domain)
                      const isSelected = selectedSkillId === skill.id
                      const pts = skillStats[skill.id]?.points || 0

                      return (
                        <motion.div
                          key={skill.id}
                          ref={(el) => {
                            if (el) nodeRefs.current.set(skill.id, el)
                            else nodeRefs.current.delete(skill.id)
                          }}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.94 }}
                          onClick={() => setSelectedSkillId(isSelected ? null : skill.id)}
                          className={`relative flex flex-col items-center cursor-pointer transition-all ${
                            isSelected ? 'z-30' : 'z-10'
                          }`}
                        >
                          {/* Circular Node */}
                          <div
                            className={`w-13 h-13 sm:w-18 sm:h-18 rounded-full border-2 flex flex-col items-center justify-center p-1 transition-all relative shadow-lg ${
                              isSelected
                                ? 'border-accent bg-accent/20 scale-110 shadow-accent/40 ring-4 ring-accent/30'
                                : `${style.border} ${style.bg} hover:border-accent/60`
                            }`}
                            style={{
                              boxShadow: isSelected ? `0 0 25px ${style.glow}` : undefined,
                            }}
                          >
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${style.dot} mb-0.5`} />
                            <span className="text-[9px] sm:text-xs font-black text-foreground text-center leading-tight max-w-[50px] sm:max-w-[64px] truncate">
                              {skill.name}
                            </span>
                            <span className="text-[7.5px] sm:text-[9px] font-bold text-accent mt-0.5">
                              {formatPointsBadge(skill)}
                            </span>
                          </div>

                          {/* Stat Pill below Node (Points Only) */}
                          <div className="mt-1 text-center">
                            <span className="block text-[8.5px] sm:text-[9px] font-extrabold text-foreground tabular-nums">
                              {pts.toLocaleString()} pts
                            </span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* MODE 2: DETAILED CARDS VIEW */
          <div className="space-y-2.5">
            {filteredSkills.map((skill) => {
              const style = getDomainStyle(skill.domain)
              const isSelected = selectedSkillId === skill.id
              const pts = skillStats[skill.id]?.points || 0
              const reps = skillStats[skill.id]?.reps || 0
              const isTime = skill.trackingType === 'time'
              const parentSkill = skills.find((s) => s.id === skill.previousSkillId)

              return (
                <motion.div
                  key={skill.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSkillId(isSelected ? null : skill.id)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-accent/15 border-accent shadow-md'
                      : 'bg-surface border-border/80 hover:border-accent/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${style.dot} shrink-0`} />
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                          {skill.name}
                          <span className={`text-[8.5px] sm:text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
                            {skill.domain}
                          </span>
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-muted mt-0.5">
                          {parentSkill ? `Requires: ${parentSkill.name}` : 'Base Skill'} • Multiplier:{' '}
                          <strong className="text-accent">{formatPointsBadge(skill)}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black text-accent tabular-nums">
                        {pts.toLocaleString()} pts
                      </span>
                      <span className="block text-[9px] sm:text-[10px] text-muted">
                        {reps.toLocaleString()} {isTime ? 'secs' : 'reps'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button for Quick Log */}
      {onAddEntry && (
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsQuickLogOpen(true)}
          className="fixed bottom-26 sm:bottom-28 right-4 sm:right-6 z-40 w-32 sm:w-36 py-3 px-3 bg-accent text-background font-extrabold rounded-full shadow-2xl shadow-accent/40 flex items-center justify-center gap-1.5 border border-white/20"
        >
          <span className="text-xs sm:text-sm shrink-0">⚡</span>
          <span className="text-[11px] sm:text-xs tracking-wide truncate">Quick Log</span>
        </motion.button>
      )}
    </div>
  )
}
