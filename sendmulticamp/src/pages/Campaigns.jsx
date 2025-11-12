import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { format } from 'date-fns';
import styles from './Campaigns.module.css';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await api.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (campaignId) => {
    if (!confirm('Are you sure you want to send this campaign?')) return;

    try {
      await api.sendCampaign(campaignId);
      loadCampaigns();
    } catch (error) {
      console.error('Error sending campaign:', error);
      alert('Failed to send campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      await api.deleteCampaign(campaignId);
      loadCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading campaigns...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Campaigns</h1>
        <Link to="/campaigns/new" className={styles.button}>
          Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className={styles.empty}>
          <p>No campaigns yet</p>
          <Link to="/campaigns/new">Create your first campaign</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {campaigns.map((campaign) => (
            <div key={campaign.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{campaign.name}</h3>
                  <p className={styles.subject}>{campaign.subject}</p>
                  <p className={styles.meta}>
                    List: {campaign.lists?.name} \u2022 Created:{' '}
                    {format(new Date(campaign.created_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className={`${styles.status} ${styles[campaign.status]}`}>
                  {campaign.status}
                </div>
              </div>

              <div className={styles.stats}>
                <div>
                  <span className={styles.statLabel}>Sent</span>
                  <span className={styles.statValue}>
                    {campaign.sent_count}/{campaign.total_subscribers || 0}
                  </span>
                </div>
                <div>
                  <span className={styles.statLabel}>Opened</span>
                  <span className={styles.statValue}>{campaign.opened_count}</span>
                </div>
                <div>
                  <span className={styles.statLabel}>Clicked</span>
                  <span className={styles.statValue}>{campaign.clicked_count}</span>
                </div>
              </div>

              <div className={styles.actions}>
                {campaign.status === 'draft' && (
                  <>
                    <Link to={`/campaigns/${campaign.id}/edit`} className={styles.actionButton}>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleSend(campaign.id)}
                      className={`${styles.actionButton} ${styles.primary}`}
                    >
                      Send
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(campaign.id)}
                  className={`${styles.actionButton} ${styles.danger}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
