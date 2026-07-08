export type Screen = 'home' | 'logging' | 'stats' | 'friends'

export const SCREEN_TRANSITIONS: Record<Screen, Partial<Record<'up' | 'down' | 'left' | 'right', Screen>>> = {
  home: { up: 'logging', left: 'stats', right: 'friends' },
  logging: { down: 'home' },
  stats: { right: 'home' },
  friends: { left: 'home' },
}
