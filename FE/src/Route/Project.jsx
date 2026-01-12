import styles from "./Project.module.css";
import Navbar from "./Components/Navbar";
import TaskCard from "./Components/TaskCard";
import imgAvatar from "./img/avatar.png";

import { Link } from "react-router-dom";

export default function Project() {
  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.nameContainer}>
            <p id={styles.textName}>Nama Project</p>
            <p id={styles.textStatus}>70% • Work in Progress</p>
          </div>
          <div className={styles.collaboratorContainer}>
            <div className={styles.collaboratorImageContainer}>
              <Link to={"/profile"}>
                <img src={imgAvatar} id={styles.avatar}></img>
              </Link>
              <Link to={"/profile"}>
                <img src={imgAvatar} id={styles.avatar}></img>
              </Link>
            </div>
            <p id={styles.textCollaborator}>Collaborator</p>
          </div>
        </div>
        <div className={styles.projectList}>
          <TaskCard></TaskCard>
          <TaskCard></TaskCard>
          <TaskCard></TaskCard>
          <TaskCard></TaskCard>
          <TaskCard></TaskCard>
          <TaskCard></TaskCard>
        </div>
      </div>
    </>
  );
}
