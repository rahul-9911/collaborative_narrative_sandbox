const db = require('../config/db');

const Story = {
  async create({ title, description, metadata }) {
    const result = await db.query(
      'INSERT INTO stories (title, description, metadata) VALUES ($1, $2, $3) RETURNING *',
      [title, description, metadata || {}]
    );
    return result.rows[0];
  },

  async getAll() {
    const result = await db.query('SELECT * FROM stories ORDER BY created_at DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await db.query('SELECT * FROM stories WHERE id = $1', [id]);
    return result.rows[0];
  }
};

module.exports = Story;
