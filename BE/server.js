const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("helloworld");
});

//Authentication
app.post("/register", async (req, res) => {
  const { name, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  const dateCreated = new Date().toLocaleDateString("en-CA");

  const sql =
    "INSERT INTO user (name, password, pfp, project_count, follower_count, following_count, date_created) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [name, hashedPassword, "default", "./img/avatar", "0", "0".dateCreated],
    (err, fields) => {
      if (err) {
        console.log(err);
        return res.sendStatus(500);
      }
    },
  );
});

function login(name, password) {
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

    const refreshToken = signJWT(
      rows[0].id,
      name,
      rows[0].role,
      process.dotenv.jwt_refresh_key,
      "15m",
    );
    const accessToken = signJWT(
      rows[0].id,
      name,
      rows[0].role,
      process.dotenv.jwt_access_key,
      "5m",
    );

    createCookie("refresh_token", refreshToken);
    createCookie("access_token", refreshToken);
  });
}

function signJWT(id, name, role, key, expire) {
  return jwt.sign({ id: id, name: name, role: role }, key, {
    expiresIn: expire,
  });
}

function createCookie(name, cookie) {
  res.cookie(name, cookie, {
    httpOnly: true,
    samesite: "lax",
    secure: false,
  });
}

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
