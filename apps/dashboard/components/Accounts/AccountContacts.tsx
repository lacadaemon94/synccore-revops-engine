import type { AccountContactsProps } from './local';
import styles from './AccountContacts.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AccountContacts({ contacts }: AccountContactsProps) {
  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Contacts</h2>
      <div className={styles.container}>
        {contacts.map((contact) => (
          <div key={contact.id} className={styles.contactItem}>
            <div className={styles.avatar}>{getInitials(contact.name)}</div>
            <div className={styles.content}>
              <h3 className={styles.name}>{contact.name}</h3>
              <div className={styles.metadata}>
                {contact.role} · {contact.email}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
