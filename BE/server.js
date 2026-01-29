const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = express();
const db = require("./db.js");

dotenv.config();
const accessTokenExpiry = "5m";
const refreshTokenExpiry = "1h";
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

    const user = { id: rows[0].id, name: name, role: rows[0].role };
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
  console.log("refresh hit");
  const refreshToken = req.cookies.refresh_token;
  console.log(refreshToken);

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
    console.log(rows);
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

app.post("/submitProject", authenticate, (req, res) => {
  const user = req.user;
  const { name, tasks } = req.body;

  const dateCreated = new Date().toLocaleDateString("en-CA");

  const projectQuery =
    "INSERT INTO project (name, task_count, user_id) VALUES (?, ?, ?)";
  const projectCountQuery =
    "UPDATE user SET project_count = project_count WHERE id = ?";

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
        const taskQuery =
          "INSERT INTO task (name, milestone_count, project_id) VALUES (?, ?, ?)";

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

            const milestoneQuery =
              "INSERT INTO milestone (name, task_id) VALUES ?";

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

app.get("/fetchProjectList/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM project WHERE user_id = ?";

  db.query(sql, [id], (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    res.send(rows);
  });
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
    console.log(err);
    return res.sendStatus(403);
  }
}

app.delete("/log", (req, res) => {
  const accessToken = req.cookies.access_token;
  const refreshToken = req.cookies.access_token;

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
