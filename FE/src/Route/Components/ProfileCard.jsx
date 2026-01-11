import imgAvatar from "./img/avatar.png";
import styles from "./ProfileCard.module.css";

export default function ProfileCard() {
  return (
    <>
      <div className={styles.container}>
        <img src={imgAvatar} id={styles.avatar} />
        <div className={styles.nameContainer}>
          <p id={styles.textName}>Username</p>
          <p id={styles.textProject}>50 Project</p>
        </div>
      </div>
    </>
  );
}
