import Navbar from "./Components/Navbar";
import ProjectCard from "./Components/ProjectCard";
import styles from "./Profile.module.css";
import imgAvatar from "./img/avatar.png";

export default function Profile() {
  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src={imgAvatar} id={styles.avatar} />
          <div className={styles.nameContainer}>
            <p id={styles.textName}>Username</p>
            <p id={styles.textProject}>50 Projects</p>
          </div>
          <div className={styles.newProjectContainer}>
            <button id={styles.button}>New Project</button>
          </div>
        </div>
        <div className={styles.projectList}>
          <ProjectCard></ProjectCard>
          <ProjectCard></ProjectCard>
          <ProjectCard></ProjectCard>
          <ProjectCard></ProjectCard>
        </div>
      </div>
    </>
  );
}
