const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "project-management-app",
  password: "",
});

module.exports = pool;
