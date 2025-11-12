import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import styles from './SMTPServers.module.css';

export default function SMTPServers() {
  const [servers, setServers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingServer, setEditingServer] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testingServer, setTestingServer] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    host: '',
    port: 587,
    username: '',
    password: '',
    use_tls: true,
    daily_limit: 0,
    is_active: true
  });

  useEffect(() => {
    loadServers();
  }, []);

  const loadServers = async () => {
    try {
      const data = await api.getSMTPServers();
      setServers(data);
    } catch (error) {
      console.error('Error loading SMTP servers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingServer) {
        await api.updateSMTPServer(editingServer.id, formData);
      } else {
        await api.createSMTPServer(formData);
      }
      setShowModal(false);
      setEditingServer(null);
      resetForm();
      loadServers();
    } catch (error) {
      alert('Error saving SMTP server: ' + error.message);
    }
  };

  const handleEdit = (server) => {
    setEditingServer(server);
    setFormData({
      name: server.name,
      host: server.host,
      port: server.port,
      username: server.username,
      password: '',
      use_tls: server.use_tls,
      daily_limit: server.daily_limit,
      is_active: server.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this SMTP server?')) return;
    try {
      await api.deleteSMTPServer(id);
      loadServers();
    } catch (error) {
      alert('Error deleting SMTP server: ' + error.message);
    }
  };

  const toggleActive = async (server) => {
    try {
      await api.updateSMTPServer(server.id, { is_active: !server.is_active });
      loadServers();
    } catch (error) {
      alert('Error updating server status: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      host: '',
      port: 587,
      username: '',
      password: '',
      use_tls: true,
      daily_limit: 0,
      is_active: true
    });
  };

  const handleTestEmail = async (e) => {
    e.preventDefault();
    setTestingInProgress(true);
    try {
      const result = await api.testSMTPServer(testingServer.id, testEmail);
      alert(`✅ ${result.message}\n\nMessage ID: ${result.messageId}\n\nCheck your inbox at ${testEmail}`);
      setShowTestModal(false);
      setTestEmail('');
      setTestingServer(null);
    } catch (error) {
      alert(`❌ Test email failed!\n\n${error.message}`);
    } finally {
      setTestingInProgress(false);
    }
  };

  const openTestModal = (server) => {
    setTestingServer(server);
    setShowTestModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>SMTP Servers</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingServer(null);
            setShowModal(true);
          }}
          className={styles.button}
        >
          Add SMTP Server
        </button>
      </div>

      <div className={styles.info}>
        <p>Manage multiple SMTP servers for sending campaigns. The system will automatically rotate between active servers.</p>
      </div>

      <div className={styles.serversGrid}>
        {servers.length === 0 ? (
          <div className={styles.empty}>
            <p>No SMTP servers configured yet</p>
            <p>Add your first SMTP server to start sending campaigns</p>
          </div>
        ) : (
          servers.map((server) => (
            <div key={server.id} className={`${styles.serverCard} ${!server.is_active ? styles.inactive : ''}`}>
              <div className={styles.serverHeader}>
                <h3>{server.name}</h3>
                <span className={`${styles.badge} ${server.is_active ? styles.active : styles.disabled}`}>
                  {server.is_active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className={styles.serverDetails}>
                <div className={styles.detailRow}>
                  <strong>Host:</strong> {server.host}:{server.port}
                </div>
                <div className={styles.detailRow}>
                  <strong>Username:</strong> {server.username}
                </div>
                <div className={styles.detailRow}>
                  <strong>TLS:</strong> {server.use_tls ? 'Enabled' : 'Disabled'}
                </div>
                <div className={styles.detailRow}>
                  <strong>Daily Limit:</strong> {server.daily_limit > 0 ? server.daily_limit : 'Unlimited'}
                </div>
                <div className={styles.detailRow}>
                  <strong>Today:</strong> {server.emails_sent_today || 0} emails sent
                </div>
              </div>

              <div className={styles.serverActions}>
                <button
                  onClick={() => openTestModal(server)}
                  className={styles.testButton}
                  title="Send test email"
                >
                  Test Email
                </button>
                <button
                  onClick={() => toggleActive(server)}
                  className={styles.toggleButton}
                >
                  {server.is_active ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleEdit(server)}
                  className={styles.editButton}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(server.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingServer ? 'Edit SMTP Server' : 'Add SMTP Server'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Server Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Gmail, SendGrid, Mailgun"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Host *</label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Port *</label>
                  <input
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Username *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Password {editingServer && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required={!editingServer}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Daily Limit (0 = unlimited)</label>
                <input
                  type="number"
                  value={formData.daily_limit}
                  onChange={(e) => setFormData({ ...formData, daily_limit: parseInt(e.target.value) })}
                  min="0"
                />
                <small>Maximum emails per day from this server</small>
              </div>

              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.use_tls}
                    onChange={(e) => setFormData({ ...formData, use_tls: e.target.checked })}
                  />
                  Use TLS/SSL
                </label>
              </div>

              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Server is active
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingServer(null);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit">{editingServer ? 'Update' : 'Add'} Server</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTestModal && testingServer && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
            <h2>Send Test Email</h2>
            <p>Server: <strong>{testingServer.name}</strong></p>

            <form onSubmit={handleTestEmail}>
              <div className={styles.formGroup}>
                <label>Send test email to: *</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                />
                <small>A test email will be sent to verify your SMTP configuration</small>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => {
                    setShowTestModal(false);
                    setTestEmail('');
                    setTestingServer(null);
                  }}
                  disabled={testingInProgress}
                >
                  Cancel
                </button>
                <button type="submit" disabled={testingInProgress}>
                  {testingInProgress ? 'Sending...' : 'Send Test Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
