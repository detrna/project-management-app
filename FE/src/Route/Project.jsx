import styles from "./Project.module.css";
import Navbar from "./Components/Navbar";
import TaskCard from "./Components/TaskCard";
import imgAvatar from "./img/avatar.png";

import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";

export default function Project() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  const [project, setProject] = useState(null);

  async function fetchProject() {
    try {
      const res = await fetch(`http://localhost:3000/fetchProject/${id}`);
      if (!res.ok) throw new Error("Couldn't get responses from fetchProject");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(
    () => async () => {
      setProject(await fetchProject());
    },
    [user],
  );

  function log() {
    console.log(id);
  }

  if (!project) return <></>;

  console.log(project.tasks);

  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.userCard}>
            <Link to={`/profile/${project.user_id}`}>
              <img src={imgAvatar} id={styles.avatar} />
            </Link>
            <div className={styles.nameContainer}>
              <p id={styles.textName}>{project.name}</p>

              <p id={styles.textStatus}>
                {project.completion}% • {project.status}
              </p>
            </div>
          </div>
          <div className={styles.collaboratorContainer}>
            <div className={styles.collaboratorImageContainer}>
              <Link to={"/profile"}>
                <img src={imgAvatar} id={styles.avatarCollaborator}></img>
              </Link>
              <Link to={"/profile"}>
                <img src={imgAvatar} id={styles.avatarCollaborator}></img>
              </Link>
            </div>
            <Link to={"/collaborators"} className={styles.link}>
              <p id={styles.textCollaborator}>Collaborator</p>
            </Link>
          </div>
        </div>
        <div className={styles.taskList}>
          {project.tasks.map((task) => {
            return (
              <TaskCard
                key={task.id}
                taskName={task.name}
                taskCompletion={`${task.milestone_completed} / ${task.milestone_count}`}
                milestones={task.milestone}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
