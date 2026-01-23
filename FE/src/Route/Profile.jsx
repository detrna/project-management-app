import { Link } from "react-router-dom";
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
          <div className={styles.userCard}>
            <img src={imgAvatar} id={styles.avatar} />
            <div className={styles.nameContainer}>
              <p id={styles.textName}>Username</p>
              <div className={styles.followerContainer}>
                <Link className={styles.link} to={"/follower"}>
                  <span id={styles.textFollower}>10 Follower</span>
                </Link>
                <span id={styles.textFollower}> • </span>
                <Link className={styles.link} to={"/following"}>
                  <span id={styles.textFollower}>10 Following</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.projectContainer}>
          <div className={styles.projectHeader}>
            <div className={styles.projectTitle}>
              <h2 id={styles.textProject}>50 Projects</h2>
              <input id={styles.input} placeholder="search here..."></input>
            </div>
            <div className={styles.newProjectContainer}>
              <Link to={"/create-project"}>
                <button id={styles.button}>New Project</button>
              </Link>
            </div>
          </div>

          <div className={styles.projectList}>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
            <ProjectCard></ProjectCard>
          </div>
        </div>
      </div>
    </>
  );
}
