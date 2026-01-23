import avatar from "./img/avatar.png";
import styles from "./CollaboratorCard.module.css";
import { Link } from "react-router-dom";

export default function CollaboratorCard({ username, roleName }) {
  return (
    <div className={styles.userCard}>
      <Link className={styles.link} to={"/profile"}>
        <div className={styles.credentials}>
          <img src={avatar} id={styles.avatar}></img>
          <p id={styles.textUsername}>{username}</p>
        </div>
      </Link>
      <div>
        <button id={styles.roleButton}>{roleName}</button>
      </div>
    </div>
  );
}
