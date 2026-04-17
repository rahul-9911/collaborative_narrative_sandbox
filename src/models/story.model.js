const db = require('../config/db');

const Story = {
  async create({ title, description, metadata }) {
    const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    const result = await db.query(
      'INSERT INTO stories (title, description, metadata, slug) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, metadata || {}, slug]
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
  },

  async getBySlug(slug) {
    const result = await db.query('SELECT * FROM stories WHERE slug = $1', [slug]);
    return result.rows[0];
  }
};

module.exports = Story;
