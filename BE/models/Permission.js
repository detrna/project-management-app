const pool = require("../config/pool");

const Permission = {
  findByProjectId: async (id) => {
    const [rows] = await pool.query(
      "SELECT r.*, p.role_id AS permission_role_id, p.task_id AS permission_task_id FROM project INNER JOIN role r ON p.id = r.project_id INNER JOIN permission p ON r.id = p.role_id WHERE project.id = ?",
      [id],
    );
    return rows;
  },
  create: async (permission, connection) => {
    const [result] = await connection.query(
      "INSERT INTO permission (role_id, task_id) VALUES ?",
      [permission],
    );
    return result;
  },
};

module.exports = Permission;
