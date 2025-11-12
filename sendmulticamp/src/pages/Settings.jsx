import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import styles from './Settings.module.css';

export default function Settings() {
  const [settings, setSettings] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    use_tls: true
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.getSMTPSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.saveSMTPSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className={styles.container}>
      <h1>Settings</h1>

      <div className={styles.section}>
        <h2>SMTP Configuration</h2>
        <p className={styles.description}>
          Configure your SMTP server settings to send email campaigns
        </p>

        <form onSubmit={handleSave}>
          <div className={styles.field}>
            <label htmlFor="host">SMTP Host</label>
            <input
              id="host"
              name="host"
              type="text"
              value={settings.host}
              onChange={handleChange}
              placeholder="smtp.gmail.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="port">SMTP Port</label>
            <input
              id="port"
              name="port"
              type="number"
              value={settings.port}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              value={settings.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={settings.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.checkboxField}>
            <input
              id="use_tls"
              name="use_tls"
              type="checkbox"
              checked={settings.use_tls}
              onChange={handleChange}
            />
            <label htmlFor="use_tls">Use TLS</label>
          </div>

          {saved && (
            <div className={styles.success}>Settings saved successfully!</div>
          )}

          <button type="submit" className={styles.button}>
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
