import { Nav } from "./Nav";
import { SidebarContext } from "./SidebarContext";
import { SidebarToggle } from "./SidebarToggle";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  actionCount?: number;
  accountsCount?: number;
  eventsCount?: string;
  reconcilerCount?: number;
  queueCount?: number;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.mark}>S</span>
          <div className={styles.branding}>
            <div className={styles.title}>SyncCore</div>
            <div className={styles.subtitle}>acme · prod</div>
          </div>
        </div>
        <SidebarToggle />
      </div>

      <Nav {...props} />

      <div className={styles.contextSlot}>
        <SidebarContext />
      </div>

      <div className={styles.footer}>
        <div className={styles.footerLabel}>Runtime</div>
        <div className={styles.statusGroup}>
          <div className={styles.statusIndicator} />
          <span className={styles.statusText}>Supabase · live</span>
        </div>
        <div className={styles.footerVersion}>v0.41.2 · us-east-1</div>
      </div>
    </aside>
  );
}
