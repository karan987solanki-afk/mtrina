import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import styles from './CampaignEditor.module.css';

export default function CampaignEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lists, setLists] = useState([]);
  const [campaign, setCampaign] = useState({
    name: '',
    subject: '',
    from_name: '',
    from_email: '',
    reply_to: '',
    list_id: '',
    html_content: '',
    text_content: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLists();
    if (id) {
      loadCampaign();
    }
  }, [id]);

  const loadLists = async () => {
    try {
      const data = await api.getLists();
      setLists(data);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const loadCampaign = async () => {
    try {
      const data = await api.getCampaign(id);
      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await api.updateCampaign(id, campaign);
      } else {
        await api.createCampaign(campaign);
      }
      navigate('/campaigns');
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCampaign((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.container}>
      <h1>{id ? 'Edit Campaign' : 'Create Campaign'}</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.section}>
          <h2>Campaign Details</h2>

          <div className={styles.field}>
            <label htmlFor="name">Campaign Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={campaign.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="list_id">Select List</label>
            <select
              id="list_id"
              name="list_id"
              value={campaign.list_id}
              onChange={handleChange}
              required
            >
              <option value="">Choose a list...</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="subject">Subject Line</label>
            <input
              id="subject"
              name="subject"
              type="text"
              value={campaign.subject}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Sender Information</h2>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="from_name">From Name</label>
              <input
                id="from_name"
                name="from_name"
                type="text"
                value={campaign.from_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="from_email">From Email</label>
              <input
                id="from_email"
                name="from_email"
                type="email"
                value={campaign.from_email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="reply_to">Reply To</label>
            <input
              id="reply_to"
              name="reply_to"
              type="email"
              value={campaign.reply_to}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2>Email Content</h2>

          <div className={styles.field}>
            <label htmlFor="html_content">HTML Content</label>
            <textarea
              id="html_content"
              name="html_content"
              value={campaign.html_content}
              onChange={handleChange}
              rows={15}
              placeholder="<h1>Welcome!</h1><p>Your email content here...</p>"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="text_content">Plain Text Version</label>
            <textarea
              id="text_content"
              name="text_content"
              value={campaign.text_content}
              onChange={handleChange}
              rows={10}
              placeholder="Plain text version of your email..."
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/campaigns')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button type="submit" disabled={loading} className={styles.saveButton}>
            {loading ? 'Saving...' : id ? 'Update Campaign' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}
