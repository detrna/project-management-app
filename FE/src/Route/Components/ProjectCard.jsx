import styles from "./ProjectCard.module.css";
import { Link } from "react-router-dom";

export default function ProjectCard({
  projectName,
  projectLink,
  projectCompletion,
  projectStatus,
}) {
  return (
    <Link to={projectLink} className={styles.link}>
      <div className={styles.container}>
        <p id={styles.textNama}>{projectName}</p>
        <p id={styles.textStatus}>
          {projectCompletion}% • {projectStatus}
        </p>
      </div>
    </Link>
  );
}
