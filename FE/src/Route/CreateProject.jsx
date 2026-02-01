import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./CreateProject.module.css";
import { useContext, useState } from "react";
import { Fragment } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";
import { authFetch } from "../Functions/AuthFetch";

export default function CreateProject() {
  const { user } = useContext(AuthContext);
  console.log(user);

  const navigate = useNavigate();

  const [projectName, setProjectName] = useState("");
  const [taskId, setTaskId] = useState(1);
  const [tasks, setTasks] = useState([
    { id: taskId, name: "", milestones: [""] },
  ]);

  function handleAddTask() {
    const nextId = taskId + 1;
    setTaskId(nextId);
    setTasks([...tasks, { id: nextId, name: "", milestones: [""] }]);
  }

  function handleRemoveTask(taskIndex) {
    const nextId = taskId - 1;
    setTaskId(nextId);
    setTasks((prevTask) => prevTask.filter((_, i) => i !== taskIndex));
  }

  function handleInputTask(index, value) {
    setTasks((prevTask) =>
      prevTask.map((task, i) =>
        i === index ? { ...task, name: value } : task,
      ),
    );
  }

  function handleAddMilestone(id) {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) => {
        if (id === index) {
          return { ...task, milestones: [...task.milestones, ""] };
        }
        return task;
      }),
    );
  }

  function handleRemoveMilestone(taskIndex, milestoneIndex) {
    setTasks((prevTask) =>
      prevTask.map((task, i) => {
        if (taskIndex !== i) return task;

        return {
          ...task,
          milestones: task.milestones.filter((_, j) => milestoneIndex !== j),
        };
      }),
    );
  }

  function handleInputMilestone(taskIndex, milestoneIndex, value) {
    console.log(taskIndex, milestoneIndex);

    setTasks((prevTask) =>
      prevTask.map((task, i) => {
        if (i !== taskIndex) {
          return task;
        }

        return {
          ...task,
          milestones: task.milestones.map((milestone, j) => {
            if (j !== milestoneIndex) return milestone;
            return value;
          }),
        };
      }),
    );
  }

  async function handleSubmit() {
    const emptyInput = detectEmptyInput();
    if (emptyInput) return;
    const submit = await submitProject();
    if (submit) navigate(`/profile/${user?.id}`);
  }

  async function submitProject() {
    const project = { name: projectName, tasks: tasks };

    try {
      const res = await authFetch("/submitProject", "POST", project);

      if (!res.ok) throw new Error("Couldnt fetch responses");

      const data = await res.json();
      console.log(data);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  function detectEmptyInput() {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].name === "") return true;

      for (let j = 0; j < tasks[i].milestones.length; j++) {
        if (tasks[i].milestones[j] === "") return true;
      }
    }
  }

  function log() {
    console.log(tasks);
  }

  console.log(user);

  if (user === null) {
    navigate("/");
  }

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Create new Project</h1>
            {user && (
              <Link to={`/profile/${user.id}`}>
                <button id={styles.backButton}>Back</button>
              </Link>
            )}
          </div>
          <div className={styles.inputSection}>
            <input
              className={styles.input}
              placeholder="project name..."
              onChange={(e) => setProjectName(e.target.value)}
            ></input>
            {tasks.map((t, i) => (
              <Fragment key={i}>
                <div className={styles.taskContainer}>
                  <input
                    className={styles.input}
                    placeholder={"task " + (i + 1) + "..."}
                    value={t.name}
                    onChange={(e) => handleInputTask(i, e.target.value)}
                  ></input>
                  <button
                    className={styles.button}
                    id={styles.addMilestone}
                    onClick={() => handleAddMilestone(i)}
                  >
                    Add Milestone
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleRemoveTask(i)}
                  >
                    -
                  </button>
                </div>

                {tasks[i].milestones.map((m, j) => (
                  <div className={styles.milestoneContainer} key={j}>
                    <input
                      className={styles.milestoneInput}
                      placeholder={"milestone " + (j + 1) + "..."}
                      onChange={(e) =>
                        handleInputMilestone(i, j, e.target.value)
                      }
                      value={m}
                    ></input>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemoveMilestone(i, j)}
                    >
                      -
                    </button>
                  </div>
                ))}
              </Fragment>
            ))}
            <button className={styles.button} onClick={handleAddTask}>
              Add Task
            </button>
            <button className={styles.button} onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
