import { Link } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./CreateProject.module.css";

export default function CreateProject() {
  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Create new Project</h1>
            <Link to={"/profile"}>
              <button id={styles.backButton}>Back</button>
            </Link>
          </div>
          <div className={styles.inputSection}>
            <input
              className={styles.input}
              placeholder="project name..."
            ></input>
            <div className={styles.taskContainer}>
              <input className={styles.input} placeholder="task 1..."></input>
              <button className={styles.button} id={styles.addMilestone}>
                Add Milestone
              </button>
            </div>
            <input
              className={styles.input}
              placeholder="milestone name..."
            ></input>
            <button className={styles.button}>Add Task</button>
            <button className={styles.button}>Submit</button>
          </div>
        </div>
      </div>
    </>
  );
}
