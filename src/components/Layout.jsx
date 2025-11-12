import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout({ children, onLogout }) {
  const location = useLocation();

  const handleSignOut = () => {
    onLogout();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.container}>
      <nav className={styles.sidebar}>
        <div className={styles.logo}>SendMultiCamp</div>

        <div className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navItem} ${isActive('/') ? styles.active : ''}`}
          >
            Dashboard
          </Link>
          <Link
            to="/lists"
            className={`${styles.navItem} ${isActive('/lists') ? styles.active : ''}`}
          >
            Lists
          </Link>
          <Link
            to="/campaigns"
            className={`${styles.navItem} ${isActive('/campaigns') || location.pathname.startsWith('/campaigns') ? styles.active : ''}`}
          >
            Campaigns
          </Link>
          <Link
            to="/smtp-servers"
            className={`${styles.navItem} ${isActive('/smtp-servers') ? styles.active : ''}`}
          >
            SMTP Servers
          </Link>
          <Link
            to="/email-filters"
            className={`${styles.navItem} ${isActive('/email-filters') ? styles.active : ''}`}
          >
            Email Filters
          </Link>
          <Link
            to="/settings"
            className={`${styles.navItem} ${isActive('/settings') ? styles.active : ''}`}
          >
            Settings
          </Link>
        </div>

        <button onClick={handleSignOut} className={styles.signOut}>
          Sign Out
        </button>
      </nav>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
