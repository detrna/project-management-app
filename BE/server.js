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
const refreshTokenExpiry = "5m";
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
    "INSERT INTO user (name, password, pfp, project_count, follower_count, following_count, date_created, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [
      name,
      hashedPassword,
      "default",
      "./img/avatar",
      "0",
      "0",
      dateCreated,
      "default",
    ],
    (err, fields) => {
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
    },
  );
});

app.post("/login", (req, res) => {
  const { name, password } = req.body;

  const sql = "SELECT (id, name, password, role) FROM user WHERE name = ?";

  db.query(sql, [name], async (err, rows, fields) => {
    if (err) {
      console.log(err);
      return res.sendStatus(500);
    }

    if (rows.length === 0) return res.sendStatus(401);

    const hashedPassword = rows[0].password;

    const isMatch = await bcrypt.compare(hashedPassword, password);
    if (!isMatch) return res.sendStatus(401);

    const refreshToken = jwt.sign(
      {
        id: rows[0].id,
        name: name,
        role: rows[0].role,
      },
      process.dotenv.JWT_REFRESH_KEY,
      { expiresIn: refreshTokenExpiry },
    );
    const accessToken = jwt.sign(
      {
        id: rows[0].id,
        name: name,
        role: rows[0].role,
      },
      process.dotenv.JWT_ACCESS_KEY,
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
  });
});

app.get("/fetchProfile", authenticate, (req, res) => {
  const user = req.user;
  res.json(user);
});

app.post("/refresh", (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (!refreshToken) return res.sendStatus(401);

  try {
    const user = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

    const refreshToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      process.dotenv.JWT_REFRESH_KEY,
      { expiresIn: refreshTokenExpiry },
    );
    const accessToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
      },
      process.dotenv.JWT_ACCESS_KEY,
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
  } catch {
    return res.sendStatus(403);
  }
});

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

function authenticate(req, res, next) {
  const accessToken = req.cookies.access_token;
  console.log(accessToken);

  if (!accessToken) {
    return res.sendStatus(401);
  }

  try {
    console.log("decoding");
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_KEY);

    console.log("verified");
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.sendStatus(403);
  }
}

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
