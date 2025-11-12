import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import styles from './Lists.module.css';

export default function Lists() {
  const [lists, setLists] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newList, setNewList] = useState({ name: '', description: '' });

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
              {list.subscribers?.[0]?.count || 0} subscribers
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
    </div>
  );
}
