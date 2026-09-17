import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Tournament } from '../models/Tournament'
import type { Skill } from '../models/Skill'

interface TournamentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  tournament: Tournament
  mainSkills: Skill[]
  isActive: boolean
  onToggleActive: () => void
  onUpdateSkills: (updatedSkills: Skill[]) => void
  onSetMapping: (tournamentSkillId: string, mainSkillId: string) => void
}

export function TournamentDetailsModal({
  isOpen,
  onClose,
  tournament,
  mainSkills,
  isActive,
  onToggleActive,
  onUpdateSkills,
  onSetMapping,
}: TournamentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'scheme' | 'mapping'>('leaderboard')
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null)
  const [editPoints, setEditPoints] = useState<number>(1)

  const handleSaveSkillEdit = (skillId: string) => {
    const updated = tournament.skills.map((s) =>
      s.id === skillId ? { ...s, pointsPerRep: editPoints } : s,
    )
    onUpdateSkills(updated)
    setEditingSkillId(null)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg bg-surface border border-border/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative max-h-[90dvh] flex flex-col my-auto"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Tournament
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full animate-pulse">
                      ACTIVE MODE
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-foreground mt-1">{tournament.name}</h3>
                <p className="text-xs text-muted line-clamp-1">{tournament.description}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-foreground rounded-full hover:bg-white/5 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Active Switcher Banner */}
            <div className="bg-background border border-border/70 rounded-2xl p-3 mb-4 flex justify-between items-center shrink-0">
              <div>
                <span className="text-xs font-bold text-foreground block">
                  {isActive ? 'Tracking Tournament Points' : 'Tournament Inactive'}
                </span>
                <span className="text-[10px] text-muted">
                  {isActive ? 'All logged reps will count towards tournament leaderboard' : 'Activate mode to switch tracking to tournament scheme'}
                </span>
              </div>
              <button
                onClick={onToggleActive}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-accent text-background font-black shadow-lg shadow-accent/20 hover:scale-105'
                }`}
              >
                {isActive ? 'Exit Tourney' : 'Enter Mode'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border/60 mb-4 shrink-0">
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'leaderboard' ? 'border-accent text-accent' : 'border-transparent text-muted'
                }`}
              >
                Leaderboard ({tournament.members.length})
              </button>
              <button
                onClick={() => setActiveTab('scheme')}
                className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'scheme' ? 'border-accent text-accent' : 'border-transparent text-muted'
                }`}
              >
                Shared Scheme ({tournament.skills.length})
              </button>
              <button
                onClick={() => setActiveTab('mapping')}
                className={`flex-1 py-2 text-xs font-bold transition-colors border-b-2 ${
                  activeTab === 'mapping' ? 'border-accent text-accent' : 'border-transparent text-muted'
                }`}
              >
                Exercise Mapping
              </button>
            </div>

            {/* Tab 1: Leaderboard */}
            {activeTab === 'leaderboard' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {tournament.members
                  .sort((a, b) => b.points - a.points)
                  .map((m, idx) => (
                    <div
                      key={m.id}
                      className="flex justify-between items-center bg-background/80 border border-border/60 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-muted w-5">#{idx + 1}</span>
                        <div>
                          <span className="text-xs font-bold text-foreground block">@{m.username}</span>
                          {idx === 0 && <span className="text-[9px] font-bold text-amber-400">👑 Tournament Leader</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-accent tabular-nums">
                          {m.points.toLocaleString()}
                        </span>
                        <span className="block text-[9px] text-muted">points</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* Tab 2: Shared Collaborative Scheme */}
            {activeTab === 'scheme' && (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                <p className="text-[10px] text-muted mb-2">
                  ℹ️ Collaborative scheme: Members can edit point multipliers for this tournament.
                </p>
                {tournament.skills.map((s) => (
                  <div
                    key={s.id}
                    className="bg-background/80 border border-border/60 rounded-xl p-3 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-xs font-bold text-foreground block">{s.name}</span>
                      <span className="text-[10px] text-muted">Domain: {s.domain || 'Skill'}</span>
                    </div>

                    {editingSkillId === s.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="0.1"
                          value={editPoints}
                          onChange={(e) => setEditPoints(parseFloat(e.target.value) || 1)}
                          className="w-16 bg-surface border border-accent text-foreground text-xs font-bold rounded-lg px-2 py-1 text-center"
                        />
                        <button
                          onClick={() => handleSaveSkillEdit(s.id)}
                          className="bg-accent text-background text-[10px] font-bold px-2 py-1 rounded-lg"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          setEditingSkillId(s.id)
                          setEditPoints(s.pointsPerRep)
                        }}
                        className="cursor-pointer text-right bg-accent/10 border border-accent/20 hover:border-accent px-2.5 py-1 rounded-lg transition-all"
                      >
                        <span className="text-xs font-black text-accent tabular-nums">{s.pointsPerRep}</span>
                        <span className="text-[10px] text-muted ml-1">
                          {s.trackingType === 'time' ? `pt/${s.timeUnitSeconds || 1}s` : 'pts/rep'} ✏️
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Manual Exercise Mapping */}
            {activeTab === 'mapping' && (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                <p className="text-[10px] text-muted bg-accent/5 border border-accent/15 p-2.5 rounded-xl">
                  🔗 Map tournament exercises to your Main Profile exercises. Logging an exercise in Tournament Mode will also track reps/seconds under your Main Profile!
                </p>
                {tournament.skills.map((tSkill) => {
                  const mappedMainId = tournament.exerciseMappings[tSkill.id] || ''
                  return (
                    <div
                      key={tSkill.id}
                      className="bg-background/80 border border-border/60 rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-foreground">
                          🏆 Tourney Exercise: <span className="text-accent">{tSkill.name}</span>
                        </span>
                        <span className="text-[10px] text-muted">({tSkill.pointsPerRep} pts)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted font-medium shrink-0">Maps to Main:</span>
                        <select
                          value={mappedMainId}
                          onChange={(e) => onSetMapping(tSkill.id, e.target.value)}
                          className="flex-1 bg-surface border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent"
                        >
                          <option value="">-- No Mapping (Tourney Only) --</option>
                          {mainSkills.map((mSkill) => (
                            <option key={mSkill.id} value={mSkill.id}>
                              {mSkill.name} ({mSkill.domain})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
