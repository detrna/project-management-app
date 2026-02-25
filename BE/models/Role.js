const pool = require("../config/pool");

const Role = {
  create: async (role, connection = pool) => {
    const [result] = await connection.query(
      "INSERT INTO role (name, project_id) VALUES ?",
      [role],
    );
    return result;
  },
  findByProjectId: async (id) => {
    const [rows] = await pool.query(
      "SELECT r.*, p.role_id AS permission_role_id, p.task_id AS permission_task_id FROM project INNER JOIN role r ON project.id = r.project_id INNER JOIN permission p ON r.id = p.role_id WHERE project.id = ?",
      [id],
    );
    return rows;
  },
};

module.exports = Role;
