"use client"
import { useState, useEffect } from 'react'
import { 
  UserIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  ClockIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import RequireAuth from '@/components/auth/RequireAuth'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  address?: string
  city?: string
  country: string
  avatar?: string
  bio?: string
  subjects: string[]
  grade?: string
  school?: string
}

interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  lessonReminders: boolean
  packageUpdates: boolean
  promotions: boolean
  weeklyDigest: boolean
}

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'tutors_only'
  showEmail: boolean
  showPhone: boolean
  allowMessages: boolean
  allowReviews: boolean
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'account'>('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lessonReminders: true,
    packageUpdates: true,
    promotions: false,
    weeklyDigest: true
  })
  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'tutors_only',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    allowReviews: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        
        console.log('🔍 Fetching user settings from backend...')
        
        // Implementazione API user settings in attesa di backend endpoint
        // const [userProfile, notificationSettings, privacySettings] = await Promise.all([
        //   userService.getProfile(),
        //   userService.getNotificationSettings(),
        //   userService.getPrivacySettings()
        // ])
        
        // TODO: Implementare API backend per profilo utente
        setProfile(null)
        
      } catch (err) {
        console.error('❌ Error fetching settings:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const saveProfile = async (updatedProfile: Partial<UserProfile>) => {
    try {
      setSaving(true)
      console.log('💾 Saving profile updates...', updatedProfile)
      // await userService.updateProfile(updatedProfile)
      // Simula salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error('❌ Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const saveNotifications = async (settings: NotificationSettings) => {
    try {
      setSaving(true)
      console.log('💾 Saving notification settings...', settings)
      // await userService.updateNotificationSettings(settings)
      setNotifications(settings)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.error('❌ Error saving notifications:', err)
    } finally {
      setSaving(false)
    }
  }

  const savePrivacy = async (settings: PrivacySettings) => {
    try {
      setSaving(true)
      console.log('💾 Saving privacy settings...', settings)
      // await userService.updatePrivacySettings(settings)
      setPrivacy(settings)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.error('❌ Error saving privacy:', err)
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    try {
      setSaving(true)
      console.log('🔐 Changing password...')
      // await userService.changePassword(passwords.current, passwords.new)
      setPasswords({ current: '', new: '', confirm: '' })
      setShowPasswordForm(false)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      console.error('❌ Error changing password:', err)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profilo', icon: UserIcon },
    { id: 'notifications', label: 'Notifiche', icon: BellIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
    { id: 'account', label: 'Account', icon: CogIcon }
  ]

  if (loading) {
    return (
      <RequireAuth>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-background-secondary rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-background-secondary rounded w-2/3 mb-6"></div>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-background-secondary rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Impostazioni</h1>
          <p className="text-foreground-muted">
            Gestisci il tuo profilo e le preferenze dell'account
          </p>
        </div>

        {/* Tabs */}
        <Card className="p-6">
          <div className="flex space-x-8 border-b border-border">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors",
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-foreground-muted hover:text-foreground"
                  )}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="mt-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Informazioni Personali</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={profile?.firstName || ''}
                        onChange={(e) => profile && setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Il tuo nome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Cognome
                      </label>
                      <input
                        type="text"
                        value={profile?.lastName || ''}
                        onChange={(e) => profile && setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Il tuo cognome"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={profile?.email || ''}
                        onChange={(e) => profile && setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="la-tua-email@esempio.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        <DevicePhoneMobileIcon className="h-4 w-4 inline mr-1" />
                        Telefono
                      </label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        onChange={(e) => profile && setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="+39 xxx xxx xxxx"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        <AcademicCapIcon className="h-4 w-4 inline mr-1" />
                        Scuola
                      </label>
                      <input
                        type="text"
                        value={profile?.school || ''}
                        onChange={(e) => profile && setProfile({ ...profile, school: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                        placeholder="Nome della tua scuola"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Classe
                      </label>
                      <select
                        value={profile?.grade || ''}
                        onChange={(e) => profile && setProfile({ ...profile, grade: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="">Seleziona classe</option>
                        <option value="1_media">1ª Media</option>
                        <option value="2_media">2ª Media</option>
                        <option value="3_media">3ª Media</option>
                        <option value="1_superiore">1ª Superiore</option>
                        <option value="2_superiore">2ª Superiore</option>
                        <option value="3_superiore">3ª Superiore</option>
                        <option value="4_superiore">4ª Superiore</option>
                        <option value="5_superiore">5ª Superiore</option>
                        <option value="universita">Università</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profile?.bio || ''}
                      onChange={(e) => profile && setProfile({ ...profile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Raccontaci qualcosa di te..."
                    />
                  </div>

                  <button
                    onClick={() => profile && saveProfile(profile)}
                    disabled={saving}
                    className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <ClockIcon className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckIcon className="h-4 w-4" />
                    )}
                    Salva Profilo
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Preferenze Notifiche</h3>
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Notifiche Email', description: 'Ricevi notifiche via email' },
                      { key: 'smsNotifications', label: 'Notifiche SMS', description: 'Ricevi notifiche via SMS' },
                      { key: 'pushNotifications', label: 'Notifiche Push', description: 'Ricevi notifiche push nel browser' },
                      { key: 'lessonReminders', label: 'Promemoria Lezioni', description: 'Ricevi promemoria per le lezioni imminenti' },
                      { key: 'packageUpdates', label: 'Aggiornamenti Pacchetti', description: 'Notifiche per aggiornamenti sui tuoi pacchetti' },
                      { key: 'promotions', label: 'Promozioni', description: 'Ricevi notifiche su offerte e promozioni' },
                      { key: 'weeklyDigest', label: 'Riepilogo Settimanale', description: 'Ricevi un riepilogo settimanale delle tue attività' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-foreground">{setting.label}</div>
                          <div className="text-sm text-foreground-muted">{setting.description}</div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...notifications, [setting.key]: !notifications[setting.key as keyof NotificationSettings] }
                            saveNotifications(updated)
                          }}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            notifications[setting.key as keyof NotificationSettings]
                              ? "bg-primary"
                              : "bg-background-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              notifications[setting.key as keyof NotificationSettings]
                                ? "translate-x-6"
                                : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Impostazioni Privacy</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground-secondary mb-2">
                        Visibilità Profilo
                      </label>
                      <select
                        value={privacy.profileVisibility}
                        onChange={(e) => {
                          const updated = { ...privacy, profileVisibility: e.target.value as any }
                          savePrivacy(updated)
                        }}
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="public">Pubblico - Visibile a tutti</option>
                        <option value="tutors_only">Solo Tutor - Visibile solo ai tutor</option>
                        <option value="private">Privato - Non visibile</option>
                      </select>
                    </div>

                    {[
                      { key: 'showEmail', label: 'Mostra Email', description: 'Permetti ai tutor di vedere la tua email' },
                      { key: 'showPhone', label: 'Mostra Telefono', description: 'Permetti ai tutor di vedere il tuo numero' },
                      { key: 'allowMessages', label: 'Permetti Messaggi', description: 'Consenti ai tutor di inviarti messaggi' },
                      { key: 'allowReviews', label: 'Permetti Recensioni', description: 'Consenti ai tutor di lasciare recensioni' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-3">
                        <div>
                          <div className="font-medium text-foreground">{setting.label}</div>
                          <div className="text-sm text-foreground-muted">{setting.description}</div>
                        </div>
                        <button
                          onClick={() => {
                            const updated = { ...privacy, [setting.key]: !privacy[setting.key as keyof PrivacySettings] }
                            savePrivacy(updated)
                          }}
                          className={cn(
                            "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                            privacy[setting.key as keyof PrivacySettings]
                              ? "bg-primary"
                              : "bg-background-secondary"
                          )}
                        >
                          <span
                            className={cn(
                              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                              privacy[setting.key as keyof PrivacySettings]
                                ? "translate-x-6"
                                : "translate-x-1"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Sicurezza Account</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium text-foreground">Password</h4>
                          <p className="text-sm text-foreground-muted">Aggiorna la tua password</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordForm(!showPasswordForm)}
                          className="px-4 py-2 border border-border text-foreground-secondary rounded-md hover:bg-background-secondary transition-colors"
                        >
                          {showPasswordForm ? 'Annulla' : 'Modifica'}
                        </button>
                      </div>

                      {showPasswordForm && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground-secondary mb-2">
                              Password Attuale
                            </label>
                            <input
                              type="password"
                              value={passwords.current}
                              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground-secondary mb-2">
                              Nuova Password
                            </label>
                            <input
                              type="password"
                              value={passwords.new}
                              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground-secondary mb-2">
                              Conferma Nuova Password
                            </label>
                            <input
                              type="password"
                              value={passwords.confirm}
                              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <button
                            onClick={changePassword}
                            disabled={saving || passwords.new !== passwords.confirm || !passwords.current}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {saving ? 'Aggiornamento...' : 'Aggiorna Password'}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border border-red-500/20 rounded-lg">
                      <h4 className="font-medium text-red-600 mb-2">Zona Pericolosa</h4>
                      <p className="text-sm text-foreground-muted mb-4">
                        Elimina permanentemente il tuo account e tutti i dati associati.
                      </p>
                      <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-500/10 transition-colors">
                        <TrashIcon className="h-4 w-4" />
                        Elimina Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </RequireAuth>
  )
}
