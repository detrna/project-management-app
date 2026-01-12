import styles from "./ProjectCard.module.css";
import { Link } from "react-router-dom";

export default function ProjectCard() {
  return (
    <Link to={"/project"} className={styles.link}>
      <div className={styles.container}>
        <p id={styles.textNama}>Nama Project</p>
        <p id={styles.textStatus}>70% • Work in Progress</p>
      </div>
    </Link>
  );
}
