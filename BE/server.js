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
    "INSERT INTO user (name, password, date_created) VALUES (?, ?, ?)";
  db.query(
    sql,
    [
      name,
      hashedPassword,
      dateCreated,
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
  console.log(name, password)

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
    console.log("ismatch:", isMatch)

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
  const accessToken = req.cookies.access_token
  const refreshToken = req.cookies.refresh_token

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
  res.send({message: "Successfully logged out"})
})

app.get("/fetchProfile", authenticate, (req, res) => {
  const user = req.user;
  console.log("fetched")
  res.json(user);
  console.log(user)
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

app.get("/fetchProfileHome", (req, res) => {
  const sql = "SELECT id, name, project_count FROM user"

  db.query(sql, [], (err, rows, fields) => {
    if(err) return console.log(err)
      res.send(rows)
  })
})

app.get("/searchProfile/:name", (req, res) => {
  const name = req.params.name
  console.log(name)

  const sql = "SELECT id, name, project_count FROM user WHERE name LIKE ?"
  db.query(sql, [`%${name}%`], (err, rows, fields) => {
    if(err) return console.log(err)
    console.log(rows)
    res.send(rows)
  })
})

app.get("/fetchProfile/:id", (req, res) => {
  const id = req.params.id
  console.log("/fetchProfile hit, id:", id)

  const sql = "SELECT id, name, project_count, follower_count, following_count FROM user WHERE id = ?"
  db.query(sql, [id], (err, rows, fields) => {
    if(err) return console.log(err)
    res.send(rows[0])
  })
})

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
