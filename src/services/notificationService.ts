export interface NotificationPreferences {
  dailyReminderEnabled: boolean
  reminderTime: string
}

export interface NotificationService {
  getPreferences(): Promise<NotificationPreferences>
  setPreferences(prefs: Partial<NotificationPreferences>): Promise<void>
  scheduleDailyReminder(time: string): Promise<void>
  cancelDailyReminder(): Promise<void>
}

const DEFAULT_PREFS: NotificationPreferences = {
  dailyReminderEnabled: false,
  reminderTime: '09:00',
}

class LocalNotificationService implements NotificationService {
  async getPreferences(): Promise<NotificationPreferences> {
    // TODO: Load from Supabase user settings when backend is connected.
    return { ...DEFAULT_PREFS }
  }

  async setPreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    // TODO: Persist to Supabase when backend is connected.
    void prefs
  }

  async scheduleDailyReminder(time: string): Promise<void> {
    // TODO: Register Web Push subscription and schedule via Supabase Edge Function.
    void time
  }

  async cancelDailyReminder(): Promise<void> {
    // TODO: Cancel scheduled push via Supabase when backend is connected.
  }
}

export const notificationService = new LocalNotificationService()
