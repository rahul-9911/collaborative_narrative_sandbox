const db = require('./src/db');
async function migrate() {
  try {
    await db.query('ALTER TABLE chapters ADD COLUMN IF NOT EXISTS story_step INTEGER DEFAULT 1;');
    console.log("Migration successful: story_step added.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}
migrate();
