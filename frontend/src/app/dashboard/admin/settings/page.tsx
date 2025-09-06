'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { 
  Settings, 
  Save, 
  Eye, 
  EyeOff,
  Mail,
  Lock,
  Globe,
  Bell,
  Database,
  Key,
  RefreshCw
} from 'lucide-react';
import { api } from '@/lib/api';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
  emailNotifications: boolean;
  maxFileSize: number;
  sessionTimeout: number;
  backupEnabled: boolean;
  backupFrequency: string;
  stripePublicKey: string;
  stripeSecretKey: string;
  sendgridApiKey: string;
  databaseUrl: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Tutoring Platform',
    siteDescription: 'Piattaforma di tutoring online',
    supportEmail: 'support@tutoringplatform.com',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    maxFileSize: 10, // MB
    sessionTimeout: 30, // minutes
    backupEnabled: true,
    backupFrequency: 'daily',
    stripePublicKey: '',
    stripeSecretKey: '',
    sendgridApiKey: '',
    databaseUrl: '',
  });

  const [showSecrets, setShowSecrets] = useState({
    stripeSecret: false,
    sendgridKey: false,
    databaseUrl: false,
  });

  const [activeTab, setActiveTab] = useState('general');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In un'applicazione reale, queste verrebbero dalle API del backend
      // Per ora simuliamo con dati locali
      setSettings({
        siteName: 'Tutoring Platform',
        siteDescription: 'Piattaforma di tutoring online per studenti e tutor',
        supportEmail: 'support@tutoringplatform.com',
        maintenanceMode: false,
        registrationEnabled: true,
        emailNotifications: true,
        maxFileSize: 10,
        sessionTimeout: 30,
        backupEnabled: true,
        backupFrequency: 'daily',
        stripePublicKey: 'pk_test_...',
        stripeSecretKey: 'sk_test_...',
        sendgridApiKey: 'SG...',
        databaseUrl: 'postgresql://user:pass@localhost:5432/db',
      });
      
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Impossibile caricare le impostazioni');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Qui faresti una PUT/POST request alle API del backend
      // await api.put('/api/admin/settings', settings);
      
      // Simuliamo il salvataggio
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Impostazioni salvate con successo');
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Errore nel salvare le impostazioni');
    } finally {
      setSaving(false);
    }
  };

  const testEmailSettings = async () => {
    try {
      setError(null);
      // await api.post('/api/admin/test-email');
      setSuccess('Email di test inviata con successo');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Errore nell\'invio dell\'email di test');
    }
  };

  const createBackup = async () => {
    try {
      setError(null);
      // await api.post('/api/admin/create-backup');
      setSuccess('Backup creato con successo');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Errore nella creazione del backup');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Impostazioni</h1>
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-background-secondary rounded w-1/4"></div>
            <div className="h-4 bg-background-secondary rounded w-1/2"></div>
            <div className="h-10 bg-background-secondary rounded w-full"></div>
          </div>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'general', name: 'Generale', icon: Settings },
    { id: 'security', name: 'Sicurezza', icon: Lock },
    { id: 'integrations', name: 'Integrazioni', icon: Globe },
    { id: 'notifications', name: 'Notifiche', icon: Bell },
    { id: 'maintenance', name: 'Manutenzione', icon: Database },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Impostazioni</h1>
        <button
          onClick={saveSettings}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Salvando...' : 'Salva Modifiche'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-600 text-sm">{error}</p>
        </Card>
      )}
      
      {success && (
        <Card className="p-4 border-green-200 bg-green-50">
          <p className="text-green-600 text-sm">{success}</p>
        </Card>
      )}

      {/* Tabs */}
      <Card className="p-6">
        <div className="flex space-x-1 bg-background-secondary p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* General Settings */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Impostazioni Generali</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Nome del Sito
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Email di Supporto
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-2">
                Descrizione del Sito
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Dimensione Max File (MB)
                </label>
                <input
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-2">
                  Timeout Sessione (minuti)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="registrationEnabled"
                  checked={settings.registrationEnabled}
                  onChange={(e) => setSettings({...settings, registrationEnabled: e.target.checked})}
                  className="mr-3"
                />
                <label htmlFor="registrationEnabled" className="text-sm font-medium text-foreground">
                  Abilita Registrazione Nuovi Utenti
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                  className="mr-3"
                />
                <label htmlFor="maintenanceMode" className="text-sm font-medium text-foreground">
                  Modalità Manutenzione
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Impostazioni di Sicurezza</h3>
            
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Sicurezza Password</h4>
                <p className="text-sm text-foreground-secondary mb-4">
                  Configura i requisiti per le password degli utenti
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      Lunghezza Minima
                    </label>
                    <input
                      type="number"
                      defaultValue={8}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      Tentativi Max Login
                    </label>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Autenticazione a Due Fattori</h4>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="twoFactorRequired"
                    className="mr-3"
                  />
                  <label htmlFor="twoFactorRequired" className="text-sm font-medium text-foreground">
                    Richiedi 2FA per Admin
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Integrazioni</h3>
            
            <div className="space-y-6">
              {/* Stripe */}
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  Stripe (Pagamenti)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      Chiave Pubblica
                    </label>
                    <input
                      type="text"
                      value={settings.stripePublicKey}
                      onChange={(e) => setSettings({...settings, stripePublicKey: e.target.value})}
                      className="w-full px-3 py-2 border border-border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      Chiave Segreta
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.stripeSecret ? 'text' : 'password'}
                        value={settings.stripeSecretKey}
                        onChange={(e) => setSettings({...settings, stripeSecretKey: e.target.value})}
                        className="w-full px-3 py-2 pr-10 border border-border rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecrets({...showSecrets, stripeSecret: !showSecrets.stripeSecret})}
                        className="absolute right-3 top-2"
                      >
                        {showSecrets.stripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SendGrid */}
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  SendGrid (Email)
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      API Key
                    </label>
                    <div className="relative">
                      <input
                        type={showSecrets.sendgridKey ? 'text' : 'password'}
                        value={settings.sendgridApiKey}
                        onChange={(e) => setSettings({...settings, sendgridApiKey: e.target.value})}
                        className="w-full px-3 py-2 pr-20 border border-border rounded-lg"
                      />
                      <div className="absolute right-2 top-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => setShowSecrets({...showSecrets, sendgridKey: !showSecrets.sendgridKey})}
                        >
                          {showSecrets.sendgridKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={testEmailSettings}
                          className="text-xs bg-primary text-white px-2 py-1 rounded"
                        >
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Notifiche</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="mr-3"
                />
                <label htmlFor="emailNotifications" className="text-sm font-medium text-foreground">
                  Abilita Notifiche Email
                </label>
              </div>

              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Eventi da Notificare</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="checkbox" id="newUser" className="mr-3" defaultChecked />
                    <label htmlFor="newUser" className="text-sm text-foreground">Nuovo utente registrato</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="newBooking" className="mr-3" defaultChecked />
                    <label htmlFor="newBooking" className="text-sm text-foreground">Nuova prenotazione</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="payment" className="mr-3" defaultChecked />
                    <label htmlFor="payment" className="text-sm text-foreground">Pagamento ricevuto</label>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" id="errors" className="mr-3" defaultChecked />
                    <label htmlFor="errors" className="text-sm text-foreground">Errori di sistema</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance */}
        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Manutenzione</h3>
            
            <div className="space-y-6">
              {/* Backup */}
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Backup Database</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="backupEnabled"
                      checked={settings.backupEnabled}
                      onChange={(e) => setSettings({...settings, backupEnabled: e.target.checked})}
                      className="mr-3"
                    />
                    <label htmlFor="backupEnabled" className="text-sm font-medium text-foreground">
                      Abilita Backup Automatico
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground-secondary mb-2">
                      Frequenza Backup
                    </label>
                    <select
                      value={settings.backupFrequency}
                      onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                      className="px-3 py-2 border border-border rounded-lg"
                    >
                      <option value="hourly">Ogni ora</option>
                      <option value="daily">Giornaliero</option>
                      <option value="weekly">Settimanale</option>
                      <option value="monthly">Mensile</option>
                    </select>
                  </div>

                  <button
                    onClick={createBackup}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    Crea Backup Manuale
                  </button>
                </div>
              </div>

              {/* Database */}
              <div className="p-4 border border-border rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Database</h4>
                <div>
                  <label className="block text-sm font-medium text-foreground-secondary mb-2">
                    URL Database
                  </label>
                  <div className="relative">
                    <input
                      type={showSecrets.databaseUrl ? 'text' : 'password'}
                      value={settings.databaseUrl}
                      onChange={(e) => setSettings({...settings, databaseUrl: e.target.value})}
                      className="w-full px-3 py-2 pr-10 border border-border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecrets({...showSecrets, databaseUrl: !showSecrets.databaseUrl})}
                      className="absolute right-3 top-2"
                    >
                      {showSecrets.databaseUrl ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
