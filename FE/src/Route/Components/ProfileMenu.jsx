import styles from "./ProfileMenu.module.css";

export default function ProfileMenu({
  handleProfileButton,
  handleLogoutButton,
}) {
  return (
    <div className={styles.container}>
      <button className={styles.button} onClick={handleProfileButton}>
        Profile
      </button>
      <button className={styles.button} onClick={handleLogoutButton}>
        Log out
      </button>
    </div>
  );
}
