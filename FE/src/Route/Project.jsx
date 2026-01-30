import styles from "./Project.module.css";
import Navbar from "./Components/Navbar";
import TaskCard from "./Components/TaskCard";
import imgAvatar from "./img/avatar.png";

import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";
import { authFetch } from "../Functions/AuthFetch";

export default function Project() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [isOwner, setIsOwner] = useState(false);
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
      const refreshProject = await fetchProject();
      setProject(refreshProject);
    },
    [user],
  );

  useEffect(() => {
    if (!user || !project) return;
    setIsOwner(detectOwner);
  }, [project]);

  function detectOwner() {
    return project.user_id === user.id;
  }

  async function handleMilestone(
    milestoneId,
    milestoneCompleted,
    taskId,
    taskIndex,
  ) {
    if (!isOwner) return;

    const isSuccess = milestoneCompleted
      ? await uncheckMilestone(milestoneId, taskId)
      : await checkMilestone(milestoneId, taskId);
    if (isSuccess) {
      const refreshProject = await fetchProject();
      setProject(refreshProject);
      const detect = await detectTaskCompletion(refreshProject, taskIndex);
      if (detect) {
        const newProject = await fetchProject();
        console.log("TEST");
        const completionUpdate = await updateCompletion(newProject);

        setProject(completionUpdate);
      }
    }
  }

  async function checkMilestone(milestoneId, taskId) {
    try {
      const res = await authFetch(
        `/checkMilestone/${taskId}/${milestoneId}`,
        "PUT",
      );
      if (!res.ok)
        throw new Error("Couldn't get responses from checkMilestone");
      const data = await res.json();

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function uncheckMilestone(milestoneId, taskId) {
    try {
      const res = await authFetch(
        `/uncheckMilestone/${taskId}/${milestoneId}`,
        "PUT",
      );
      if (!res.ok)
        throw new Error("Couldn't get responses from uncheckMilestone");
      const data = await res.json();

      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function detectTaskCompletion(project, taskIndex) {
    const task = project.tasks[taskIndex];

    let res = true;
    if (
      task.completed &&
      task.milestone_completed === task.milestone_count - 1
    ) {
      res = uncheckTask(task.id);
    } else if (task.milestone_completed === task.milestone_count) {
      res = checkTask(task.id);
    }

    return res;
  }

  async function checkTask(taskId) {
    try {
      const res = await authFetch(`/checkTask/${id}/${taskId}`, "PUT");
      if (!res.ok) throw new Error("Couldn't get responses from checkTask");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
  async function uncheckTask(taskId) {
    try {
      const res = await authFetch(`/uncheckTask/${id}/${taskId}`, "PUT");
      if (!res.ok) throw new Error("Couldn't get responses from uncheckTask");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  function calculateCompletion(refreshedProject) {
    /*
    let milestoneCount = 0;
    let completedMilestone = 0;

    refreshedProject.tasks.forEach((task) => {
      task.milestone.forEach((m) => {
        milestoneCount++;
        if (m.completed) completedMilestone++;
      });
    });

    const completion = (completedMilestone * 100) / milestoneCount;
    const formattedCompletion = Math.round(completion);
    return formattedCompletion;
    */

    const tasks = refreshedProject.tasks;

    const allMilestones = tasks.flatMap((task) => task.milestone || []);

    const totalMilestones = allMilestones.length;
    const completedMilestones = allMilestones.filter((m) => m.completed).length;

    const completion = Math.round(
      (completedMilestones * 100) / totalMilestones,
    );

    return completion;
  }

  async function updateCompletion(refreshedProject) {
    try {
      const completion = calculateCompletion(refreshedProject);
      const newProjectData = {
        ...refreshedProject,
        completion: completion,
      };

      const res = await authFetch(`/updateCompletion/${id}/`, "PUT", {
        completion: completion,
      });
      if (!res.ok)
        throw new Error("Couldn't get responses from updateCopletion");
      const data = await res.json();
      console.log(data);

      console.log(newProjectData);

      return newProjectData;
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Navbar name={"username"}></Navbar>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.userCard}>
            <Link to={`/profile/${project?.user_id}`}>
              <img src={imgAvatar} id={styles.avatar} />
            </Link>
            <div className={styles.nameContainer}>
              <p id={styles.textName}>{project?.name}</p>

              <p id={styles.textStatus}>
                {project?.completion}% • {project?.status}
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
          {project?.tasks.map((task, tIndex) => {
            return (
              <TaskCard
                key={tIndex}
                owner={isOwner}
                taskName={task.name}
                taskCompletion={`${task.milestone_completed} / ${task.milestone_count}`}
                taskCompleted={task.completed}
                milestones={task.milestone}
                handleMilestoneButton={(mId, mCompleted) =>
                  handleMilestone(mId, mCompleted, task.id, tIndex)
                }
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
