import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import styles from './EmailFilters.module.css';

export default function EmailFilters() {
  const [activeTab, setActiveTab] = useState('blacklist');
  const [blacklist, setBlacklist] = useState([]);
  const [unsubscribeList, setUnsubscribeList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [reason, setReason] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'blacklist') {
        const data = await api.getBlacklist();
        setBlacklist(data);
      } else {
        const data = await api.getUnsubscribeList();
        setUnsubscribeList(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'blacklist') {
        await api.addToBlacklist(newEmail, reason);
      } else {
        await api.addToUnsubscribeList(newEmail, null, null, reason);
      }
      setNewEmail('');
      setReason('');
      setShowModal(false);
      loadData();
    } catch (error) {
      alert('Error adding email: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this email?')) return;
    try {
      if (activeTab === 'blacklist') {
        await api.removeFromBlacklist(id);
      } else {
        await api.removeFromUnsubscribeList(id);
      }
      loadData();
    } catch (error) {
      alert('Error removing email: ' + error.message);
    }
  };

  const handleCsvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          const email = line.trim();
          if (email && email.includes('@')) {
            try {
              if (activeTab === 'blacklist') {
                await api.addToBlacklist(email, 'Bulk import');
              } else {
                await api.addToUnsubscribeList(email, null, null, 'Bulk import');
              }
            } catch (err) {
              console.error(`Failed to add ${email}:`, err);
            }
          }
        }

        alert(`Import complete! Processed ${lines.length} emails.`);
        loadData();
      } catch (error) {
        alert('Error importing CSV: ' + error.message);
      } finally {
        setImporting(false);
        setCsvFile(null);
      }
    };

    reader.readAsText(file);
  };

  const currentList = activeTab === 'blacklist' ? blacklist : unsubscribeList;
  const title = activeTab === 'blacklist' ? 'Blacklist' : 'Unsubscribe List';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Email Filters</h1>
        <div className={styles.headerActions}>
          <button onClick={() => setShowModal(true)} className={styles.button}>
            Add Email
          </button>
          <label className={styles.uploadButton}>
            Import CSV
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleCsvUpload}
              disabled={importing}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'blacklist' ? styles.active : ''}`}
          onClick={() => setActiveTab('blacklist')}
        >
          Blacklist ({blacklist.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'unsubscribe' ? styles.active : ''}`}
          onClick={() => setActiveTab('unsubscribe')}
        >
          Unsubscribe List ({unsubscribeList.length})
        </button>
      </div>

      <div className={styles.info}>
        {activeTab === 'blacklist' ? (
          <p>Emails in the blacklist will <strong>never</strong> receive campaigns. Use this for spam complaints or invalid addresses.</p>
        ) : (
          <p>Emails in the unsubscribe list have opted out of campaigns. They will not receive any emails unless they re-subscribe.</p>
        )}
      </div>

      <div className={styles.tableContainer}>
        {currentList.length === 0 ? (
          <div className={styles.empty}>
            <p>No emails in {title.toLowerCase()} yet</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Reason</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((item) => (
                <tr key={item.id}>
                  <td>{item.email}</td>
                  <td>{item.reason || '-'}</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={styles.deleteButton}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Add to {title}</h2>
            <form onSubmit={handleAdd}>
              <div className={styles.formGroup}>
                <label>Email Address *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Reason (optional)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Spam complaint, Manual opt-out"
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Add Email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
