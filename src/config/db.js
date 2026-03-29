const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'storyforge',
  password: process.env.DB_PASSWORD || 'password123',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'storyforge_v1',
  port: process.env.DB_PORT || 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
