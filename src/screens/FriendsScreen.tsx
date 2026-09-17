import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import type { Skill } from '../models/Skill'
import { Card } from '../components/Card'
import { useFriends } from '../hooks/useFriends'
import { useAuth } from '../hooks/useAuth'
import { useSkills } from '../hooks/useSkills'
import { useTournaments } from '../hooks/useTournaments'
import { FriendProfileModal } from '../components/FriendProfileModal'
import { TournamentDetailsModal } from '../components/TournamentDetailsModal'
import { CreateTournamentModal } from '../components/CreateTournamentModal'
import type { Tournament } from '../models/Tournament'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

interface FriendsScreenProps {
  userLifetimePoints?: number
  skills?: Skill[]
}

export function FriendsScreen({ userLifetimePoints, skills }: FriendsScreenProps) {
  const { signOut } = useAuth()
  const { mainSkills } = useSkills()
  const { friends, leaderboard, loading, sendRequest, acceptRequest, removeFriend, searchUsers } =
    useFriends(userLifetimePoints, skills || mainSkills)
  const {
    tournaments,
    activeTournamentId,
    activeTournament,
    createTournament,
    toggleActiveTournament,
    updateTournamentSkills,
    setExerciseMapping,
  } = useTournaments()

  const [activeTab, setActiveTab] = useState<'friends' | 'tournaments'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [inspectFriend, setInspectFriend] = useState<{ username: string; total: number } | null>(null)
  const [inspectTournament, setInspectTournament] = useState<Tournament | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setSearchQuery(q)
    if (q.length > 2) {
      setIsSearching(true)
      const results = await searchUsers(q)
      setSearchResults(results)
      setIsSearching(false)
    } else {
      setSearchResults([])
    }
  }

  const pendingReceived = friends.filter((f) => f.status === 'pending_received')

  return (
    <div
      className="flex flex-col h-full px-6 pt-safe pb-safe overflow-y-auto"
      style={{
        background: '#060606',
        backgroundImage: 'radial-gradient(circle, rgba(40,40,40,0.6) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Friend Profile Modal */}
      {inspectFriend && (
        <FriendProfileModal
          isOpen={inspectFriend !== null}
          onClose={() => setInspectFriend(null)}
          friendUsername={inspectFriend.username}
          totalPoints={inspectFriend.total}
          totalReps={inspectFriend.total}
        />
      )}

      {/* Tournament Details Modal */}
      {inspectTournament && (
        <TournamentDetailsModal
          isOpen={inspectTournament !== null}
          onClose={() => setInspectTournament(null)}
          tournament={inspectTournament}
          mainSkills={mainSkills}
          isActive={activeTournamentId === inspectTournament.id}
          onToggleActive={() => toggleActiveTournament(inspectTournament.id)}
          onUpdateSkills={(updated) => updateTournamentSkills(inspectTournament.id, updated)}
          onSetMapping={(tId, mId) => setExerciseMapping(inspectTournament.id, tId, mId)}
        />
      )}

      {/* Create Tournament Modal */}
      <CreateTournamentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        mainSkills={mainSkills}
        onCreate={(name, desc, end, skills) => {
          const t = createTournament(name, desc, end, skills)
          setInspectTournament(t)
        }}
      />

      <header className="pt-8 pb-4 flex justify-between items-end shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-0.5 h-5 rounded-full" style={{ background: 'linear-gradient(to bottom, var(--theme-gradient-start), var(--theme-gradient-end))' }} />
          <div>
            <h2 className="text-2xl font-bold" style={{ color: '#f0f0f0' }}>Social &amp; Tournaments</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(120,120,120,0.8)' }}>Compete together &amp; track shared schemes</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{
            background: 'rgba(15,15,15,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(160,160,160,0.8)',
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Active Tournament Mode Bar */}
      {activeTournament && (
        <div className="bg-accent/10 border border-accent/30 rounded-2xl p-3 mb-4 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="text-xs font-bold text-accent">Active Tournament Mode</span>
            </div>
            <span className="text-sm font-black text-foreground block mt-0.5">{activeTournament.name}</span>
          </div>
          <button
            onClick={() => toggleActiveTournament(activeTournament.id)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30"
          >
            Exit Mode
          </button>
        </div>
      )}

      {/* Top Segment Control */}
      <div className="flex bg-surface/80 border border-border/80 rounded-2xl p-1 mb-5 shrink-0">
        <button
          onClick={() => setActiveTab('friends')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'friends'
              ? 'bg-accent text-background shadow-md font-extrabold'
              : 'text-muted hover:text-foreground'
          }`}
        >
          👥 Friends Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'tournaments'
              ? 'bg-accent text-background shadow-md font-extrabold'
              : 'text-muted hover:text-foreground'
          }`}
        >
          🔥 Tournaments ({tournaments.length})
        </button>
      </div>

      <motion.div
        className="flex flex-col gap-4 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* TAB 1: FRIENDS */}
        {activeTab === 'friends' && (
          <>
            {/* Search / Add Friend */}
            <motion.div variants={itemVariants}>
              <Card>
                <p className="text-sm text-muted mb-3 font-medium">Add a Friend</p>
                <input
                  type="text"
                  placeholder="Search username..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent mb-2"
                />
                {searchResults.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {searchResults.map((user) => {
                      const existingStatus = friends.find((f) => f.id === user.id)?.status
                      return (
                        <div
                          key={user.id}
                          className="flex justify-between items-center bg-background px-4 py-2 rounded-xl border border-border"
                        >
                          <span className="font-medium text-sm">@{user.username}</span>
                          {existingStatus === 'accepted' ? (
                            <span className="text-xs text-muted">Friends</span>
                          ) : existingStatus === 'pending_sent' ? (
                            <span className="text-xs text-muted">Request Sent</span>
                          ) : existingStatus === 'pending_received' ? (
                            <span className="text-xs text-muted">Requested You</span>
                          ) : (
                            <button
                              onClick={() => sendRequest(user.id)}
                              className="bg-accent text-background text-xs font-semibold px-3 py-1.5 rounded-full"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                {isSearching && <p className="text-xs text-muted text-center mt-2">Searching...</p>}
              </Card>
            </motion.div>

            {/* Friend Requests */}
            {pendingReceived.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <p className="text-sm text-accent mb-3 font-medium">Friend Requests</p>
                  <div className="flex flex-col gap-2">
                    {pendingReceived.map((req) => (
                      <div
                        key={req.id}
                        className="flex justify-between items-center bg-background px-4 py-3 rounded-xl border border-border"
                      >
                        <span className="font-medium text-sm">@{req.username}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptRequest(req.friendshipId!)}
                            className="bg-accent text-background text-xs font-semibold px-3 py-1.5 rounded-full"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => removeFriend(req.friendshipId!)}
                            className="bg-surface border border-border text-foreground text-xs font-semibold px-3 py-1.5 rounded-full"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Points Leaderboard */}
            <motion.div variants={itemVariants}>
              <Card>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm text-muted font-medium">Leaderboard (Total Points)</p>
                  <span className="text-[10px] text-muted">Tap profile to view scheme</span>
                </div>
                {loading ? (
                  <p className="text-sm text-muted text-center py-4">Loading...</p>
                ) : leaderboard.length === 0 ? (
                  <p className="text-sm text-muted text-center py-4">
                    Add some friends to see the points leaderboard!
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() =>
                          setInspectFriend({ username: entry.username, total: entry.total })
                        }
                        className="flex justify-between items-center bg-background hover:bg-surface/60 px-4 py-3 rounded-xl border border-border cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-muted font-bold text-sm w-4">{index + 1}</span>
                          <span className="font-medium text-sm text-foreground">@{entry.username}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-accent text-sm tabular-nums">
                            {entry.total.toLocaleString()}
                          </span>
                          <span className="block text-[9px] text-muted font-medium">points</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}

        {/* TAB 2: TOURNAMENTS HUB */}
        {activeTab === 'tournaments' && (
          <>
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs text-muted font-bold uppercase tracking-wider">Active Tournaments</p>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-accent text-background text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-all"
                >
                  + Create Tournament
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {tournaments.map((t) => {
                  const isActive = activeTournamentId === t.id
                  return (
                    <Card key={t.id}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-foreground">{t.name}</h4>
                            {isActive && (
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                                Active Mode
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-0.5 line-clamp-2">{t.description}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-border/50 text-xs">
                        <div className="flex items-center gap-3 text-muted">
                          <span>👥 {t.members.length} members</span>
                          <span>🎯 {t.skills.length} skills</span>
                        </div>
                        <button
                          onClick={() => setInspectTournament(t)}
                          className="text-accent font-bold hover:underline text-xs"
                        >
                          View Hub &amp; Scheme &rarr;
                        </button>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}

