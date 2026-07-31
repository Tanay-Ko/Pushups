import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { Card } from '../components/Card'
import { useFriends } from '../hooks/useFriends'
import { useAuth } from '../hooks/useAuth'
import { FriendProfileModal } from '../components/FriendProfileModal'

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

export function FriendsScreen() {
  const { signOut } = useAuth()
  const { friends, leaderboard, loading, sendRequest, acceptRequest, removeFriend, searchUsers } = useFriends()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [inspectFriend, setInspectFriend] = useState<{ username: string; total: number } | null>(null)

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
    <div className="flex flex-col h-full px-6 pt-safe pb-safe overflow-y-auto">
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

      <header className="pt-8 pb-6 flex justify-between items-end shrink-0">
        <div>
          <h2 className="text-2xl font-semibold">Friends</h2>
          <p className="text-sm text-muted mt-1">Compete together & inspect points schemes</p>
        </div>
        <button
          onClick={signOut}
          className="text-xs font-medium bg-surface text-muted px-3 py-1.5 rounded-full border border-border"
        >
          Sign Out
        </button>
      </header>

      <motion.div
        className="flex flex-col gap-4 pb-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
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
      </motion.div>
    </div>
  )
}
