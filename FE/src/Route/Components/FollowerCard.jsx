import { Link } from "react-router-dom";
import styles from "./FollowerCard.module.css";

export default function FollowerCard({
  handleFollowButton,
  username,
  profileLink,
  pfp,
  followText,
}) {
  return (
    <div className={styles.followerCard}>
      <Link className={styles.link} to={profileLink}>
        <div className={styles.credentials}>
          <img src={pfp} id={styles.avatar}></img>
          <p id={styles.textUsername}>{username}</p>
        </div>
      </Link>
      <div>
        <button id={styles.followButton} onClick={handleFollowButton}>
          {followText}
        </button>
      </div>
    </div>
  );
}
