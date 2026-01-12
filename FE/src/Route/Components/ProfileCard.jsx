import imgAvatar from "./img/avatar.png";
import styles from "./ProfileCard.module.css";
import { Link } from "react-router-dom";

export default function ProfileCard() {
  return (
    <>
      <Link to={"/profile"} className={styles.link}>
        <div className={styles.container}>
          <img src={imgAvatar} id={styles.avatar} />
          <div className={styles.nameContainer}>
            <p id={styles.textName}>Username</p>
            <p id={styles.textProject}>50 Project</p>
          </div>
        </div>
      </Link>
    </>
  );
}
