import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./CreateProject.module.css";
import { useContext, useEffect, useState } from "react";
import { Fragment } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";
import { authFetch } from "../Functions/AuthFetch";

export default function EditProject() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [projectName, setProjectName] = useState(null);
  const [taskId, setTaskId] = useState();
  const [tasks, setTasks] = useState([]);
  const [modifiedId, setModifiedId] = useState({
    deletedTask: [],
    deletedMilestone: [],
    editedTask: [],
    editedMilestone: [],
  });

  function handleAddTask() {
    const nextId = taskId + 1;
    setTaskId(nextId);
    setTasks([
      ...tasks,
      {
        id: nextId,
        name: "",
        new: true,
        milestone: [{ new: true, name: "" }],
      },
    ]);
  }

  function handleRemoveTask(taskIndex) {
    const nextId = taskId - 1;
    setTaskId(nextId);
    setTasks((prevTask) => prevTask.filter((_, i) => i !== taskIndex));
    !tasks[taskIndex].new &&
      setModifiedId((prev) => ({
        ...prev,
        deletedTask: [...prev.deletedTask, tasks[taskIndex].id],
      }));
  }

  function handleInputTask(index, value) {
    setTasks((prevTask) =>
      prevTask.map((task, i) =>
        i === index ? { ...task, name: value } : task,
      ),
    );

    !tasks[index].new &&
      !modifiedId.editedTask.includes(tasks[index].id) &&
      setModifiedId((prev) => ({
        ...prev,
        editedTask: [...prev.editedTask, tasks[index].id],
      }));
  }

  function handleAddMilestone(id) {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) => {
        if (id === index) {
          return {
            ...task,
            milestone: [...task.milestone, { new: true, name: "" }],
          };
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
          milestone: task.milestone.filter((_, j) => milestoneIndex !== j),
        };
      }),
    );
    !tasks[taskIndex].milestone[milestoneIndex].new &&
      setModifiedId((prev) => ({
        ...prev,
        deletedMilestone: [
          ...prev.deletedMilestone,
          tasks[taskIndex].milestone[milestoneIndex].id,
        ],
      }));
  }

  function handleInputMilestone(taskIndex, milestoneIndex, value) {
    setTasks((prevTask) =>
      prevTask.map((task, i) => {
        if (i !== taskIndex) {
          return task;
        }

        return {
          ...task,
          milestone: task.milestone.map((m, j) => {
            if (j !== milestoneIndex) return m;
            return { ...m, name: value };
          }),
        };
      }),
    );

    !tasks[taskIndex].milestone[milestoneIndex].new &&
      !modifiedId.editedMilestone.includes(
        tasks[taskIndex].milestone[milestoneIndex].id,
      ) &&
      setModifiedId((prev) => ({
        ...prev,
        editedMilestone: [
          ...prev.editedMilestone,
          tasks[taskIndex].milestone[milestoneIndex].id,
        ],
      }));
  }

  async function handleSubmit() {
    const emptyInput = detectEmptyInput();
    if (emptyInput) return;
    await submitProject();
    const submit = await updateCompletion();
    if (submit) navigate(`/project/${id}`);
  }

  async function submitProject() {
    const project = { name: projectName, tasks, modifiedId };

    try {
      const res = await authFetch(`/projects/${id}`, "PUT", { project });
      if (!res.ok) throw new Error("Couldnt fetch responses");
      const data = await res.json();
      console.log(data);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  async function updateCompletion() {
    try {
      const res = await authFetch(`/projects/${id}/completion`, "PUT");
      if (!res.ok)
        throw new Error("Couldn't get responses from project/compeltion");
      const data = await res.json();
      console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  function detectEmptyInput() {
    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].name === "") return true;

      for (let j = 0; j < tasks[i].milestone.length; j++) {
        if (tasks[i].milestone[j] === "") return true;
      }
    }
  }

  async function getCurrentProject() {
    try {
      const res = await authFetch(`/fetchProject/${id}`);
      if (!res.ok) throw new Error("Couldn't get responses from fetchProject");
      const data = await res.json();
      return data;
    } catch (err) {
      console.log(err.message);
      return false;
    }
  }

  useEffect(() => {
    const fetchProject = async () => {
      const currentProject = await getCurrentProject();

      if (currentProject) {
        setProject(currentProject);

        const currentTasks = currentProject.tasks.map((t) => {
          return t;
        });

        setTasks(currentTasks);
        setTaskId(currentTasks.length);
        setProjectName(currentProject.name);
      }
    };

    fetchProject();
  }, []);

  function log() {
    console.log(tasks);
  }

  if (!project) return <></>;

  if (user === null) {
    navigate("/");
  }

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Modify Project</h1>
            {user && (
              <Link to={`/project/${id}`}>
                <button id={styles.backButton}>Back</button>
              </Link>
            )}
          </div>
          <div className={styles.inputSection}>
            <input
              className={styles.input}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            ></input>
            {tasks?.map((t, i) => (
              <Fragment key={i}>
                <div className={styles.taskContainer}>
                  <input
                    className={styles.input}
                    placeholder={`task ${i + 1}...`}
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

                {t.milestone.map((m, j) => (
                  <div className={styles.milestoneContainer} key={j}>
                    <input
                      className={styles.milestoneInput}
                      placeholder={`milestone ${j + 1}...`}
                      onChange={(e) =>
                        handleInputMilestone(i, j, e.target.value)
                      }
                      value={m.name}
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
            )) || <></>}
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
