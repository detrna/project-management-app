const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = express();
const router = express.Router();
const db = require("./db.js");
const pool = require("./config/pool.js");
const RoleSchema = require("./schema/Role.schema.js");
const Role = require("./models/role.js");
const { validate } = require("./middleware/validate.js");
const PermissionSchema = require("./schema/Permission.schema.js");
const Permission = require("./models/Permission.js");

dotenv.config();
const accessTokenExpiry = "5m";
const refreshTokenExpiry = "30d";
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("helloworld");
});

//Authentication
app.post("/register", async (req, res) => {
  const { name, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const dateCreated = new Date().toLocaleDateString("en-CA");

  const nameQuery = "SELECT name FROM USER WHERE NAME = ?";

  db.query(nameQuery, [name], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    if (rows.length !== 0) {
      return res.sendStatus(409);
    }

    const sql =
      "INSERT INTO user (name, password, date_created) VALUES (?, ?, ?)";
    db.query(sql, [name, hashedPassword, dateCreated], (err, fields) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      const sqlSelect = "SELECT * FROM user WHERE name = ?";

      db.query(sqlSelect, [name], (err, rows, fields) => {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }
        const refreshToken = jwt.sign(
          {
            id: rows[0].id,
            name: name,
            role: rows[0].role,
          },
          process.env.JWT_REFRESH_KEY,
          { expiresIn: refreshTokenExpiry },
        );
        const accessToken = jwt.sign(
          {
            id: rows[0].id,
            name: name,
            role: rows[0].role,
          },
          process.env.JWT_ACCESS_KEY,
          { expiresIn: accessTokenExpiry },
        );

        res.cookie("access_token", accessToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });

        res.cookie("refresh_token", refreshToken, {
          httpOnly: true,
          sameSite: "lax",
          secure: false,
        });

        const user = { id: rows[0].id, name: name, role: rows[0].role };
        res.json(user);
      });
    });
  });
});

app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const sql = "SELECT id, name, password, role FROM user WHERE name = ?";

  db.query(sql, [name], async (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    if (rows.length === 0) return res.sendStatus(401);

    const hashedPassword = rows[0].password;

    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) return res.sendStatus(401);

    const refreshToken = jwt.sign(
      {
        id: rows[0].id,
        name: rows[0].name,
        role: rows[0].role,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: refreshTokenExpiry },
    );
    const accessToken = jwt.sign(
      {
        id: rows[0].id,
        name: rows[0].name,
        role: rows[0].role,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: accessTokenExpiry },
    );

    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    const user = { id: rows[0].id, name: rows[0].name, role: rows[0].role };
    res.json(user);
  });
});

app.delete("/logout", (req, res) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.refresh_token;

  res.clearCookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.clearCookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.send({ message: "Successfully logged out" });
});

app.get("/fetchProfile", authenticate, (req, res) => {
  const user = req.user;
  res.json({ id: user.id, name: user.name, role: user.role });
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) return res.sendStatus(401);

  try {
    const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

    const newRefreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: refreshTokenExpiry },
    );
    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: accessTokenExpiry },
    );

    res.cookie("refresh_token", newRefreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.send({ message: "refreshed token successfully" });
  } catch {
    return res.sendStatus(403);
  }
});

//Home page
app.get("/fetchProfileHome", (req, res) => {
  const sql = "SELECT id, name, project_count FROM user";

  db.query(sql, [], (err, rows, fields) => {
    if (err) return console.log(err);
    res.send(rows);
  });
});

app.get("/searchProfile/:name", (req, res) => {
  const name = req.params.name;

  const sql = "SELECT id, name, project_count FROM user WHERE name LIKE ?";
  db.query(sql, [`%${name}%`], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(rows);
  });
});

app.get("/fetchProfile/:id", (req, res) => {
  const id = req.params.id;

  const sql =
    "SELECT id, name, project_count, follower_count, following_count, pfp FROM user WHERE id = ?";
  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(rows[0]);
  });
});

//Project
app.post("/submitProject", authenticate, (req, res) => {
  const user = req.user;
  const { name, tasks } = req.body;

  const projectQuery =
    "INSERT INTO project (name, task_count, user_id) VALUES (?, ?, ?)";
  const projectCountQuery =
    "UPDATE user SET project_count = project_count + 1 WHERE id = ?";
  const taskQuery =
    "INSERT INTO task (name, milestone_count, project_id) VALUES (?, ?, ?)";
  const milestoneQuery = "INSERT INTO milestone (name, task_id) VALUES ?";

  let completedQuery = 0;

  db.query(projectCountQuery, [user.id], (err, pResult) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    db.query(projectQuery, [name, tasks.length, user.id], (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      const newProjectId = result.insertId;

      tasks.forEach((task) => {
        db.query(
          taskQuery,
          [task.name, task.milestones.length, newProjectId],
          (err, tResult) => {
            if (err) {
              console.log(err);
              return res.sendStatus(500);
            }

            const newTaskId = tResult.insertId;

            const milestonePayload = task.milestones.map((milestone) => [
              milestone,
              newTaskId,
            ]);

            db.query(milestoneQuery, [milestonePayload], (err, mResult) => {
              if (err) {
                console.log(err);
                return res.sendStatus(500);
              }
              completedQuery++;
              if (completedQuery === tasks.length) {
                res.json({ message: "Data inserted successfully" });
              }
            });
          },
        );
      });
    });
  });
});

app.get("/fetchProjectList/:userid", (req, res) => {
  const { userid } = req.params;

  const sql = "SELECT * FROM project WHERE user_id = ?";

  db.query(sql, [userid], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
});

app.get("/fetchGuestProjectList/:uid", (req, res) => {
  const { uid } = req.params;
  console.log("TEST");

  const sql =
    "SELECT p.* FROM project p INNER JOIN collaboration c ON p.id = c.project_id WHERE c.user_id = ?";

  db.query(sql, [uid], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    console.log(rows);
    res.send(rows);
  });
});

app.get("/fetchProject/:id", (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT p.*, t.id AS tId, t.name AS tName, t.description AS tDescription, t.completed AS tCompleted, t.milestone_count AS tMilestoneCount, t.milestone_completed AS tMilestoneCompleted, m.id AS mId, m.name AS mName, m.description AS mDescription, m.completed AS mCompleted, m.task_id AS mTaskId FROM project p LEFT JOIN task t ON p.id = t.project_id LEFT JOIN milestone m ON t.id = m.task_id WHERE p.id = ?";

  try {
    db.query(sql, [id], (err, rows, fields) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      const tasks = rows.map((row) => row.tId);
      let taskFilter = [];

      const milestones = rows.map((row) => row.mTaskId);

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i] === tasks[i + 1]) continue;

        taskFilter.push({
          id: rows[i].tId,
          name: rows[i].tName,
          description: rows[i].tDescription,
          completed: rows[i].tCompleted,
          milestone_count: rows[i].tMilestoneCount,
          milestone_completed: rows[i].tMilestoneCompleted,
          milestone: [],
        });
      }

      for (let i = 0; i < taskFilter.length; i++) {
        for (let j = 0; j < milestones.length; j++) {
          if (taskFilter[i].id === milestones[j]) {
            taskFilter[i].milestone.push({
              id: rows[j].mId,
              name: rows[j].mName,
              description: rows[j].mDescription,
              completed: rows[j].mCompleted,
              task_id: rows[j].mTaskId,
            });
          }
        }
      }

      const project = {
        id: rows[0].id,
        name: rows[0].name,
        description: rows[0].description,
        date: rows[0].date,
        task_count: rows[0].task_count,
        task_completed: rows[0].task_completed,
        status: rows[0].status,
        completion: rows[0].completion,
        user_id: rows[0].user_id,
        tasks: taskFilter,
      };

      res.send(project);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/searchProject/:name", (req, res) => {
  const { name } = req.params;

  const sql = "SELECT * FROM project WHERE name LIKE ?";

  db.query(sql, [`%${name}%`], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
});

app.put("/checkMilestone/:task_id/:milestone_id", authenticate, (req, res) => {
  const user = req.user;
  const { task_id, milestone_id } = req.params;

  const milestoneQuery = "UPDATE milestone SET completed = 1 WHERE id = ?";
  const taskQuery =
    "UPDATE task SET milestone_completed = milestone_completed + 1 WHERE id = ?";

  db.query(milestoneQuery, [milestone_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    db.query(taskQuery, [task_id], (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      res.send({ message: "Milestone checked successfully" });
    });
  });
});

app.put(
  "/uncheckMilestone/:task_id/:milestone_id",
  authenticate,
  (req, res) => {
    const user = req.user;
    const { task_id, milestone_id } = req.params;

    const milestoneQuery = "UPDATE milestone SET completed = 0 WHERE id = ?";
    const taskQuery =
      "UPDATE task SET milestone_completed = milestone_completed - 1 WHERE id = ?";

    db.query(milestoneQuery, [milestone_id], (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      db.query(taskQuery, [task_id], (err, result) => {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }
        res.send({ message: "Milestone unchecked successfully" });
      });
    });
  },
);

app.put("/checkTask/:project_id/:task_id", authenticate, (req, res) => {
  const user = req.user;
  const { project_id, task_id } = req.params;

  const sql = "UPDATE task SET completed = 1 WHERE id = ?";
  const projectQuery =
    "UPDATE project SET task_completed = task_completed + 1 WHERE id = ?";

  db.query(sql, [task_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    db.query(projectQuery, [project_id], (err, result) => {
      if (err) {
        console.log(err);
        return sendStatus(500);
      }
      res.send({ message: "Task checked successfully" });
    });
  });
});

app.put("/uncheckTask/:project_id/:task_id", authenticate, (req, res) => {
  const user = req.user;
  const { project_id, task_id } = req.params;

  const sql = "UPDATE task SET completed = 0 WHERE id = ?";
  const projectQuery =
    "UPDATE project SET task_completed = task_completed + - 1 WHERE id = ?";

  db.query(sql, [task_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    db.query(projectQuery, [project_id], (err, result) => {
      if (err) {
        console.log(err);
        return sendStatus(500);
      }
      res.send({ message: "Task checked successfully" });
    });
  });
});

app.put("/projects/:id/completion/", authenticate, async (req, res) => {
  const { id } = req.params;

  const [project_milestone] = await pool.query(
    "SELECT m.completed AS completed_milestone FROM project p INNER JOIN task t ON p.id = t.project_id INNER JOIN milestone m ON t.id = m.task_id WHERE p.id = ?",
    [id],
  );

  const completed = project_milestone.filter((m) => m.completed_milestone);
  const completion = Math.ceil(
    (completed.length / project_milestone.length) * 100,
  );

  await pool.query("UPDATE project SET completion = ?", [completion]);
  res.send({ message: "Project completion updated successfully" });
});

app.put("/updateCompletion/:id/", authenticate, (req, res) => {
  const { id } = req.params;
  const { completion } = req.body;

  const sql = "UPDATE project SET completion = ? WHERE ID = ?";

  db.query(sql, [completion, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send({ message: "Completion succesfully updated" });
  });
});

app.put("/projects/:id", authenticate, async (req, res) => {
  const { project } = req.body;
  const { id } = req.params;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (project.modifiedId.deletedMilestone.length !== 0) {
      const milestoneDeleteIds = project.modifiedId.deletedMilestone;
      const milestoneDeletePlaceholder = milestoneDeleteIds
        .map(() => "?")
        .join(",");

      await connection.query(
        `DELETE FROM milestone WHERE id IN (${milestoneDeletePlaceholder})`,
        milestoneDeleteIds,
      );
    }

    if (project.modifiedId.deletedTask.length !== 0) {
      const taskDeleteIds = project.modifiedId.deletedTask;
      const taskDeletePlaceHolder = taskDeleteIds.map(() => "?").join(",");
      await connection.query(
        `DELETE FROM task WHERE id IN (${taskDeletePlaceHolder})`,
        taskDeleteIds,
      );
    }

    if (project.modifiedId.editedMilestone.length !== 0) {
      const milestoneUpdates = project.modifiedId.editedMilestone.map((m) => {
        const value = project.tasks
          .flatMap((t) => t.milestone)
          .find((milestone) => milestone.id === m)?.name;
        return { id: m, name: value };
      });

      const milestoneIds = milestoneUpdates.map((m) => m.id);
      const caseParamsMilestone = milestoneUpdates.flatMap((m) => [
        m.id,
        m.name,
      ]);
      const caseStatementMilestone = milestoneUpdates
        .map(() => `WHEN ? THEN ?`)
        .join(" ");
      const placeholderMilestone = milestoneUpdates.map(() => "?").join(",");

      await connection.query(
        `UPDATE milestone SET name = CASE id ${caseStatementMilestone} END WHERE id IN (${placeholderMilestone})`,
        [...caseParamsMilestone, ...milestoneIds],
      );
    }

    const taskIds = project.modifiedId.editedTask;
    if (taskIds.length !== 0) {
      const taskUpdates = taskIds.map((id) => {
        const task = project.tasks.find((t) => t.id === id);
        return { id, name: task?.name };
      });

      const caseParamsMilestone = taskUpdates.flatMap((t) => [t.id, t.name]);
      const caseStatementTask = taskIds.map(() => `WHEN ? THEN ?`).join(" ");
      const placeholdersTask = taskIds.map(() => "?").join(",");

      await connection.query(
        `UPDATE task SET name = CASE id ${caseStatementTask} END WHERE id IN (${placeholdersTask})`,
        [...caseParamsMilestone, ...taskIds],
      );
    }

    const newTasks = project.tasks
      .filter((t) => t.new)
      .map((t) => {
        return [t.name, t.milestone.length, parseInt(id)];
      });

    let insertedTaskId = [];
    if (newTasks.length !== 0) {
      const [taskResult] = await connection.query(
        `INSERT INTO task (name, milestone_count, project_id) VALUES ?`,
        [newTasks],
      );
      insertedTaskId = newTasks.map((_, i) => taskResult.insertId + i);
    }
    const oldTaskId = project.tasks.filter((t) => !t.new).map((t) => t.id);
    const newTaskId =
      insertedTaskId.length === 0
        ? oldTaskId
        : [...oldTaskId, ...insertedTaskId];
    const newMilestone = project.tasks.flatMap((t, i) =>
      t.milestone
        .filter((m) => m.new)
        .map((m) => {
          return [m.name, newTaskId[i]];
        }),
    );

    if (newMilestone.length !== 0) {
      await connection.query("INSERT INTO milestone (name, task_id) VALUES ?", [
        newMilestone,
      ]);
    }

    await connection.commit();

    res.json({ message: "Successfully modified project" });
  } catch (err) {
    await connection.rollback();
    console.log(err);
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
});
//Follow
app.post("/follow/:id", authenticate, (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const sql = "INSERT INTO follower (user_id, follower_id) VALUES (?, ?)";
  const follower_count_sql =
    "UPDATE user SET follower_count = follower_count + 1 WHERE id = ?";

  const following_count_sql =
    "UPDATE user SET following_count = following_count + 1 WHERE id = ?";

  db.query(sql, [id, user.id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    db.query(follower_count_sql, [id], (err, fResult) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      db.query(following_count_sql, [user.id], (err, fResult) => {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }

        res.send({ message: "Account followed successfully" });
      });
    });
  });
});

app.delete("/unfollow/:id", authenticate, (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const sql = "DELETE FROM follower WHERE follower_id = ? AND user_id = ?";
  const follower_count_sql =
    "UPDATE user SET follower_count = follower_count - 1 WHERE id = ?";
  const following_count_sql =
    "UPDATE user SET following_count = following_count - 1 WHERE id = ?";

  db.query(sql, [user.id, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    db.query(follower_count_sql, [id], (err, fResult) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      db.query(following_count_sql, [user.id], (err, fgResult) => {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }

        res.send({ message: "Account unfollowed successfully" });
      });
    });
  });
});

app.get("/follower/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT follower_id FROM follower WHERE user_id = ?";

  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
});

app.get("/following/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT user_id FROM follower WHERE follower_id = ?";

  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }
    res.send(rows);
  });
});

app.get("/followerName/:id", (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT user.id, user.name, user.pfp FROM user INNER JOIN follower ON user.id = follower.follower_id WHERE follower.user_id = ?";

  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
});

//Mail
app.get("/mail", authenticate, (req, res) => {
  const { id } = req.user;

  const sql =
    "SELECT m.*, u.name AS sender_name, u.pfp FROM mail m INNER JOIN user u ON u.id = m.sender_id WHERE user_id = ?";

  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
});

app.delete("/acceptProject/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { mailContent } = req.body;

  const mailQuery = "DELETE FROM mail WHERE id = ?";
  const projectNameQuery = "SELECT id FROM project WHERE name = ?";
  const collaborationQuery =
    "INSERT INTO collaboration (project_id, user_id) VALUES (?, ?)";
  const projectName = mailContent.split(" · ")[1];

  db.query(mailQuery, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    db.query(projectNameQuery, [projectName], (err, rows, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      const projectId = rows[0].id;
      db.query(collaborationQuery, [projectId, user.id], (err, result) => {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }

        res.send({ message: "Project joined successfully" });
      });
    });
  });
});

app.delete("/declineProject/:id", authenticate, (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM mail WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send({ message: "Project declined successfully" });
  });
});

app.post("/invite/:project_id/:user_id", authenticate, (req, res) => {
  const user = req.user;
  const { project_id, user_id } = req.params;

  const projectQuery = "SELECT name FROM project WHERE id = ?";
  const mailQuery =
    "INSERT INTO mail (user_id, sender_id, content) VALUES (?, ?, ?)";

  db.query(projectQuery, [project_id], (err, rows, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    const projectName = rows[0].name;

    db.query(
      mailQuery,
      [user_id, user.id, `Project invitation · ${projectName}`],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.sendStatus(500);
        }

        res.send({ message: "Invitation sent successfully" });
      },
    );
  });
});

app.get("/getInvitedUser/:id", authenticate, (req, res) => {
  const user = req.user;
  const { id } = req.params;

  const projectNameQuery = "SELECT name FROM project WHERE ID = ?";
  const mailQuery = "SELECT user_id FROM mail WHERE content LIKE ?";

  db.query(projectNameQuery, [id], (err, rows, result) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    const projectName = rows[0].name;

    db.query(mailQuery, [`%${projectName}%`], (err, rows, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }

      const idRows = rows.map((u) => u.user_id);

      res.send(idRows);
    });
  });
});

//collaborator
app.get("/fetchCollaborator/:id", (req, res) => {
  const { id } = req.params;

  const sql =
    "SELECT c.*, u.name FROM collaboration c INNER JOIN user u ON c.user_id = u.id WHERE c.project_id = ?";

  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
});

app.delete(
  "/removeCollaborator/:project_id/:user_id",
  authenticate,
  (req, res) => {
    const { project_id, user_id } = req.params;

    const sql =
      "DELETE FROM collaboration WHERE project_id = ? AND user_id = ?";
    db.query(sql, [project_id, user_id], (err, result) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
      res.send({ message: "User removed successfully" });
    });
  },
);

//role
app.post(
  "/role/:projectId",
  authenticate,
  validate(RoleSchema.create),
  validate(RoleSchema.params, "params"),
  async (req, res) => {
    const { roles } = req.body;
    const { projectId } = req.params;

    const [currentRole] = await Role.getNameByProjectId(projectId);

    if (currentRole[0]) {
      const duplicateRole = roles.find((r) => {
        return currentRole.some((cr) => {
          return cr.name.trim().toLowerCase() === r.name.trim().toLowerCase();
        });
      });

      if (duplicateRole)
        return res.status(400).json({
          success: false,
          message: `The role "${duplicateRole.name}" is already exists`,
        });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const role = roles.map((role) => {
        return [role.name, projectId];
      });

      const result = await Role.create(role, connection);
      const roleIds = roles.map((_, i) => result.insertId + i);

      const permissions = roles.flatMap((role, i) =>
        role.permission.map((p) => {
          return [roleIds[i], p.taskId];
        }),
      );

      await Permission.create(permissions, connection);

      await connection.commit();
      return res.json({ success: true, message: "Role created successfully" });
    } catch (err) {
      await connection.rollback();
      console.log(err);
      return res.status(500).json({ message: err.message });
    } finally {
      connection.release();
    }
  },
);

app.get(
  "/role/:projectId",
  authenticate,
  validate(RoleSchema.params, "params"),
  async (req, res) => {
    const { projectId } = req.params;
    const [rows] = await Role.findByProjectId(projectId);
    if (!rows[0]) return res.json(null);

    let rolesMap = new Map();
    for (const row of rows) {
      if (!rolesMap.has(row.id)) {
        rolesMap.set(row.id, {
          id: row.id,
          name: row.name,
          projectId: row.project_id,
          permission: [],
        });
      }

      const currentRole = rolesMap.get(row.id);

      currentRole.permission.push({
        roleId: row.id,
        taskId: row.permission_task_id,
        name: row.permission_name,
      });
    }

    const payload = Array.from(rolesMap.values());

    return res.json(rows[0] ? payload : null);
  },
);

app.get(
  "/permission/:id",
  validate(PermissionSchema.projectIdParams, "params"),
  async (req, res) => {
    const { id } = req.params;
    const [rows] = await Permission.findByProjectId(id);

    return res.send(rows);
  },
);

app.post("/permission", validate(PermissionSchema.create), async (req, res) => {
  const { roleId, taskId } = req.body;
  const role = roleId.map((_, i) => {
    return {
      role_id: roleId[i],
      task_id: taskId[i],
    };
  });

  console.log(role);
  return res.send({ message: "OK" });
  await Permission.create(role);
  return res.json({ message: "Permission created successfully" });
});

//middleware
function authenticate(req, res, next) {
  const accessToken = req.cookies.access_token;

  if (!accessToken) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);

    req.user = decoded;
    next();
  } catch (err) {
    return res.sendStatus(403);
  }
}

app.delete("/log", (req, res) => {
  res.clearCookie("access_token", accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  res.clearCookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
});

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
