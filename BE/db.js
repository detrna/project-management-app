const mySQL = require("mysql2");

const db = mySQL.createConnection({
  user: "root",
  password: "",
  host: "localhost",
  database: "",
});

db.connect((err) => {
  if (err) {
    console.log(err);
    return;
  }
});

module.exports = db;
