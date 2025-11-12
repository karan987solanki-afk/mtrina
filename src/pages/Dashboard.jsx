import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalLists: 0,
    totalSubscribers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0
  });
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [lists, campaigns] = await Promise.all([
        api.getLists(),
        api.getCampaigns()
      ]);

      const totalSubscribers = lists.reduce((sum, list) => {
        return sum + (list.subscribers?.[0]?.count || 0);
      }, 0);

      const activeCampaigns = campaigns.filter(
        c => c.status === 'sending' || c.status === 'scheduled'
      ).length;

      setStats({
        totalLists: lists.length,
        totalSubscribers,
        totalCampaigns: campaigns.length,
        activeCampaigns
      });

      setRecentCampaigns(campaigns.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalLists}</div>
          <div className={styles.statLabel}>Total Lists</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalSubscribers}</div>
          <div className={styles.statLabel}>Total Subscribers</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.totalCampaigns}</div>
          <div className={styles.statLabel}>Total Campaigns</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.activeCampaigns}</div>
          <div className={styles.statLabel}>Active Campaigns</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Campaigns</h2>
          <Link to="/campaigns/new" className={styles.button}>
            Create Campaign
          </Link>
        </div>

        {recentCampaigns.length === 0 ? (
          <p className={styles.empty}>No campaigns yet. Create your first one!</p>
        ) : (
          <div className={styles.campaignsList}>
            {recentCampaigns.map((campaign) => (
              <div key={campaign.id} className={styles.campaignCard}>
                <div>
                  <h3>{campaign.name}</h3>
                  <p className={styles.campaignMeta}>
                    List: {campaign.lists?.name} • Status: {campaign.status}
                  </p>
                </div>
                <div className={styles.campaignStats}>
                  <span>Sent: {campaign.sent_count}/{campaign.total_subscribers}</span>
                  <span>Opened: {campaign.opened_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
