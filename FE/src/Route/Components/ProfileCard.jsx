import imgAvatar from "./img/avatar.png";
import styles from "./ProfileCard.module.css";
import { Link } from "react-router-dom";

export default function ProfileCard({id, username, projectCount}) {
  return (
    <>
      <Link to={`/profile/${id}`} className={styles.link}>
        <div className={styles.container}>
          <img src={imgAvatar} id={styles.avatar} />
          <div className={styles.nameContainer}>
            <p id={styles.textName}>{username}</p>
            {projectCount ?
            <p id={styles.textProject}>{projectCount} Projects</p>
            : <p id={styles.textProject}>No projects yet</p>}
          </div>
        </div>
      </Link>
    </>
  );
}
