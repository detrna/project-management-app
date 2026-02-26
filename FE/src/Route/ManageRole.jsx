import { Link, useParams } from "react-router-dom";
import Navbar from "./Components/Navbar";
import styles from "./ManageRole.module.css";
import { useContext, useState } from "react";
import { Fragment } from "react";
import { AuthContext } from "../AuthServices/AuthProvider";
import { authFetch } from "../Functions/AuthFetch";
import { fetchProject } from "../Functions/fetchProject";
import { useEffect } from "react";

export default function ManageRole() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [roles, setRoles] = useState([{ name: "", permission: [] }]);
  const [project, setProject] = useState(null);
  const [addMenu, setAddMenu] = useState(false);
  const [roleInput, setRoleInput] = useState(null);
  const [errorMessage, setErrorMessage] = useState(false);

  const onLoad = async () => {
    const currentProject = await fetchProject(id);
    if (currentProject) setProject(currentProject);
    const getRole = await fetchRole();
    if (getRole) setRoles(getRole);
    if (currentProject)
      setRoleInput([
        {
          name: "",
          permission: [
            {
              name: currentProject.tasks[0].name,
              taskId: currentProject.tasks[0].id,
            },
          ],
        },
      ]);
    setErrorMessage(null);
  };

  useEffect(() => {
    onLoad();
  }, []);

  async function fetchRole() {
    try {
      const res = await authFetch(`/role/${id}`);
      if (!res.ok) throw new Error("Couldn't get responses from role");
      const data = await res.json();
      console.log(data);
      return data;
    } catch (err) {
      const data = await res.json();
      console.log(data);
      return data;
    }
  }

  function handleMenu() {
    setAddMenu(addMenu ? false : true);
  }

  function handleAddRole() {
    setRoleInput([
      ...roleInput,
      {
        name: "",
        permission: [
          { name: project.tasks[0].name, taskId: project.tasks[0].id },
        ],
      },
    ]);
  }

  function handleRemoveRole(id) {
    setRoleInput((prev) => prev.filter((_, i) => i !== id));
  }

  function handleInputRole(id, value) {
    setRoleInput((prev) =>
      prev.map((r, i) => (i === id ? { ...r, name: value } : r)),
    );
  }

  function handleAddPermission(id) {
    if (roleInput[id].permission.length === project.tasks.length) return;

    setRoleInput((prev) =>
      prev.map((r, i) => {
        if (i === id) {
          return {
            ...r,
            permission: [
              ...r.permission,
              {
                name: project.tasks[0].name,
                taskId: project.tasks[0].id,
              },
            ],
          };
        }
        return r;
      }),
    );
  }
  function handleRemovePermission(roleIndex, permissionIndex) {
    setRoleInput((prev) => {
      console.log(roleIndex, permissionIndex);
      console.log(prev[roleIndex].permission[permissionIndex]);
      const newState = prev.map((r, i) =>
        i === roleIndex
          ? {
              ...r,
              permission: r.permission.filter((_, j) => j !== permissionIndex),
            }
          : r,
      );
      console.log(newState);
      return newState;
    });
  }

  function handleInputPermission(roleIndex, permissionIndex, value) {
    const indexedTask = project.tasks.find((t) => t.id === Number(value));
    if (!indexedTask) return;
    setRoleInput((prev) =>
      prev.map((r, i) =>
        i === roleIndex
          ? {
              ...r,
              permission: [
                ...r.permission.map((m, j) =>
                  j === permissionIndex
                    ? { name: indexedTask.name, taskId: indexedTask.id }
                    : m,
                ),
              ],
            }
          : r,
      ),
    );
  }

  async function handleSubmit() {
    const response = await createRole();
    console.log(response);
    if (response.success) {
      const refreshedRoles = await fetchRole();
      setRoles(refreshedRoles);
      handleMenu();
      onLoad();
    } else {
      setErrorMessage(response.message);
      console.log(response.message);
    }
  }

  async function createRole() {
    try {
      const roles = roleInput;
      const projectId = id;

      const res = await authFetch(`/role/${projectId}`, "POST", {
        roles,
      });
      const data = await res.json();

      if (!res.ok) throw data;
      return data;
    } catch (err) {
      console.log(err.message);
      return err;
    }
  }

  const ViewRole = () => {
    console.log(roles);
    return (
      <div>
        <div className={styles.listSectionHeader}>
          <p className={styles.roleListText}>
            {roles[0].name === null ? "There is no role yet" : "Role list"}
          </p>
          <button className={styles.addRole} onClick={handleMenu}>
            Add Role
          </button>
        </div>
        <div className={styles.roleListContainer}>
          {roles.map((r, i) => {
            return (
              <div key={i}>
                <div className={styles.roleContainer}>
                  <div className={styles.textRoleName}>{r.name}</div>
                </div>
                <p className={styles.permissionUl}>Permission: </p>
                {r.permission.map((p, j) => {
                  return (
                    <div key={j}>
                      <p className={styles.textPermissionName}>• {p.name}</p>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  function log() {
    console.log(roleInput);
  }

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.container}>
        <div className={styles.formContainer}>
          <div className={styles.header}>
            <h1 id={styles.textHeader}>Manage Role</h1>
            {/*<button onClick={log}>LOG</button>*/}
            {user && (
              <Link to={`/project/${id}`}>
                <button id={styles.backButton}>Back</button>
              </Link>
            )}
          </div>
          {addMenu ? (
            <div className={styles.inputSection}>
              <div className={styles.inputSectionHeader}>
                <h2>Add Role</h2>
                <button className={styles.addRole} onClick={handleMenu}>
                  View Roles
                </button>
              </div>
              {roleInput.map((r, i) => (
                <Fragment key={i}>
                  <div className={styles.taskContainer}>
                    <input
                      className={styles.input}
                      placeholder={"Role " + (i + 1) + "..."}
                      value={r.name}
                      onChange={(e) => handleInputRole(i, e.target.value)}
                    ></input>
                    <button
                      className={`${styles.button} ${styles.addPermission}`}
                      onClick={() => handleAddPermission(i)}
                    >
                      Add Permission
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemoveRole(i)}
                    >
                      -
                    </button>
                  </div>

                  {r.permission.map((p, j) => (
                    <div className={styles.permissionContainer} key={j}>
                      <select
                        className={styles.selectPermission}
                        onChange={(e) =>
                          handleInputPermission(i, j, e.target.value)
                        }
                        value={p.taskId}
                      >
                        {project.tasks.map((t, k) => {
                          return (
                            <option
                              value={t.id}
                              key={k}
                              className={styles.optionPermission}
                            >
                              {t.name}
                            </option>
                          );
                        })}
                      </select>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleRemovePermission(i, j)}
                      >
                        -
                      </button>
                    </div>
                  ))}
                </Fragment>
              ))}
              <button className={styles.button} onClick={handleAddRole}>
                Add Role
              </button>
              <button className={styles.button} onClick={handleSubmit}>
                Submit
              </button>
              {errorMessage && <div>{errorMessage}</div>}
            </div>
          ) : (
            <ViewRole></ViewRole>
          )}
        </div>
      </div>
    </>
  );
}
