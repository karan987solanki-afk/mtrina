import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import styles from './Lists.module.css';

export default function Lists() {
  const [lists, setLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [newList, setNewList] = useState({ name: '', description: '' });
  const [subscribers, setSubscribers] = useState([]);
  const [showSubscribers, setShowSubscribers] = useState(null);
  const [newSubscriber, setNewSubscriber] = useState({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [showAddSubscriber, setShowAddSubscriber] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({
    email: '',
    first_name: '',
    last_name: ''
  });
  const [importProgress, setImportProgress] = useState(null);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const data = await api.getLists();
      setLists(data);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createList(newList);
      setNewList({ name: '', description: '' });
      setShowModal(false);
      loadLists();
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  const loadSubscribers = async (listId) => {
    try {
      const data = await api.getSubscribers(listId);
      setSubscribers(data);
      setShowSubscribers(listId);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  };

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    try {
      await api.addSubscriber({
        ...newSubscriber,
        list_id: showSubscribers
      });
      setNewSubscriber({ email: '', first_name: '', last_name: '' });
      setShowAddSubscriber(false);
      loadSubscribers(showSubscribers);
    } catch (error) {
      alert('Error adding subscriber: ' + error.message);
    }
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').filter(line => line.trim());

      if (lines.length < 2) {
        alert('CSV file must have headers and at least one row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setCsvHeaders(headers);
      setCsvData(rows);

      const emailField = headers.find(h =>
        h.toLowerCase().includes('email') || h.toLowerCase() === 'e-mail'
      );
      const firstNameField = headers.find(h =>
        h.toLowerCase().includes('first') || h.toLowerCase().includes('fname')
      );
      const lastNameField = headers.find(h =>
        h.toLowerCase().includes('last') || h.toLowerCase().includes('lname')
      );

      setFieldMapping({
        email: emailField || '',
        first_name: firstNameField || '',
        last_name: lastNameField || ''
      });
    };

    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!fieldMapping.email) {
      alert('Please map the email field');
      return;
    }

    setImportProgress({ current: 0, total: csvData.length, success: 0, failed: 0 });

    let success = 0;
    let failed = 0;

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      try {
        await api.addSubscriber({
          list_id: selectedList,
          email: row[fieldMapping.email],
          first_name: row[fieldMapping.first_name] || '',
          last_name: row[fieldMapping.last_name] || ''
        });
        success++;
      } catch (error) {
        console.error('Failed to import:', row[fieldMapping.email], error);
        failed++;
      }
      setImportProgress({ current: i + 1, total: csvData.length, success, failed });
    }

    alert(`Import complete!\nSuccess: ${success}\nFailed: ${failed}`);
    setShowImportModal(false);
    setCsvFile(null);
    setCsvData([]);
    setCsvHeaders([]);
    setImportProgress(null);
    if (showSubscribers === selectedList) {
      loadSubscribers(selectedList);
    }
    loadLists();
  };

  const openImportModal = (listId) => {
    setSelectedList(listId);
    setShowImportModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Subscriber Lists</h1>
        <button onClick={() => setShowModal(true)} className={styles.button}>
          Create List
        </button>
      </div>

      <div className={styles.grid}>
        {lists.map((list) => (
          <div key={list.id} className={styles.card}>
            <h3>{list.name}</h3>
            <p>{list.description}</p>
            <div className={styles.meta}>
              {list.subscriber_count || 0} subscribers
            </div>
            <div className={styles.cardActions}>
              <button
                onClick={() => loadSubscribers(list.id)}
                className={styles.secondaryButton}
              >
                View Subscribers
              </button>
              <button
                onClick={() => openImportModal(list.id)}
                className={styles.importButton}
              >
                Import CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Create New List</h2>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                placeholder="List Name"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
              />
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubscribers && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
            <h2>Subscribers</h2>
            <div style={{ marginBottom: '1rem' }}>
              <button
                onClick={() => setShowAddSubscriber(true)}
                className={styles.button}
              >
                Add Subscriber
              </button>
            </div>

            {showAddSubscriber && (
              <form onSubmit={handleAddSubscriber} className={styles.addForm}>
                <input
                  type="email"
                  placeholder="Email *"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, email: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="First Name"
                  value={newSubscriber.first_name}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, first_name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newSubscriber.last_name}
                  onChange={(e) => setNewSubscriber({ ...newSubscriber, last_name: e.target.value })}
                />
                <div>
                  <button type="submit" className={styles.button}>Add</button>
                  <button
                    type="button"
                    onClick={() => setShowAddSubscriber(false)}
                    className={styles.secondaryButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.subscriberList}>
              {subscribers.length === 0 ? (
                <p>No subscribers yet</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((sub) => (
                      <tr key={sub.id}>
                        <td>{sub.email}</td>
                        <td>{sub.first_name || '-'}</td>
                        <td>{sub.last_name || '-'}</td>
                        <td>
                          <span className={styles[`status${sub.status}`]}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className={styles.modalActions}>
              <button onClick={() => setShowSubscribers(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <h2>Import Subscribers from CSV</h2>

            <div className={styles.importSection}>
              <h3>1. Upload CSV File</h3>
              <p>Your CSV should have headers in the first row (e.g., email, first_name, last_name)</p>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className={styles.fileInput}
              />
            </div>

            {csvHeaders.length > 0 && (
              <div className={styles.importSection}>
                <h3>2. Map Fields</h3>
                <p>Found {csvData.length} rows in CSV</p>

                <div className={styles.fieldMapping}>
                  <div className={styles.mappingRow}>
                    <label>Email Field (required):</label>
                    <select
                      value={fieldMapping.email}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, email: e.target.value })}
                      required
                    >
                      <option value="">-- Select --</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.mappingRow}>
                    <label>First Name Field (optional):</label>
                    <select
                      value={fieldMapping.first_name}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, first_name: e.target.value })}
                    >
                      <option value="">-- Skip --</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.mappingRow}>
                    <label>Last Name Field (optional):</label>
                    <select
                      value={fieldMapping.last_name}
                      onChange={(e) => setFieldMapping({ ...fieldMapping, last_name: e.target.value })}
                    >
                      <option value="">-- Skip --</option>
                      {csvHeaders.map(header => (
                        <option key={header} value={header}>{header}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.previewSection}>
                  <h4>Preview (first 3 rows):</h4>
                  <table className={styles.previewTable}>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 3).map((row, idx) => (
                        <tr key={idx}>
                          <td>{row[fieldMapping.email] || '(empty)'}</td>
                          <td>{row[fieldMapping.first_name] || '(empty)'}</td>
                          <td>{row[fieldMapping.last_name] || '(empty)'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importProgress && (
              <div className={styles.progressSection}>
                <h3>Importing...</h3>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  />
                </div>
                <p>
                  {importProgress.current} / {importProgress.total}
                  (Success: {importProgress.success}, Failed: {importProgress.failed})
                </p>
              </div>
            )}

            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setCsvFile(null);
                  setCsvData([]);
                  setCsvHeaders([]);
                }}
                disabled={importProgress !== null}
              >
                Cancel
              </button>
              {csvHeaders.length > 0 && (
                <button
                  onClick={handleImport}
                  disabled={!fieldMapping.email || importProgress !== null}
                  className={styles.button}
                >
                  Import {csvData.length} Subscribers
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
