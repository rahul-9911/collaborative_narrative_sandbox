const db = require('../config/db');

const Chapter = {
  async getByStoryId(storyId) {
    // 1. Fetch chapters
    const chaptersResult = await db.query('SELECT * FROM chapters WHERE story_id = $1', [storyId]);
    const chapters = chaptersResult.rows;

    // 2. Fetch all scenes for these chapters
    const scenesResult = await db.query(
      'SELECT * FROM scenes WHERE chapter_id IN (SELECT id FROM chapters WHERE story_id = $1) ORDER BY scene_order ASC', 
      [storyId]
    );
    const scenes = scenesResult.rows;

    // 3. Attach scenes to chapters
    return chapters.map(chapter => ({
      ...chapter,
      scenes: scenes.filter(s => s.chapter_id === chapter.id)
    }));
  },

  async getLeafNodes(storyId) {
    const query = `
      SELECT c.* FROM chapters c
      WHERE c.story_id = $1
      AND NOT EXISTS (SELECT 1 FROM chapters child WHERE child.parent_id = c.id)
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [storyId]);
    return result.rows;
  },

  async create({ story_id, title, content, parent_id = null }) {
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      const chapResult = await client.query(
        'INSERT INTO chapters (story_id, title, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [story_id, title, content, parent_id]
      );
      const chapter = chapResult.rows[0];

      await client.query(
        'INSERT INTO scenes (chapter_id, content, scene_order) VALUES ($1, $2, 1)',
        [chapter.id, content]
      );

      await client.query('COMMIT');
      return { ...chapter, scenes: [{ content, scene_order: 1 }] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async addScene(chapterId, content) {
    const orderResult = await db.query('SELECT MAX(scene_order) FROM scenes WHERE chapter_id = $1', [chapterId]);
    const nextOrder = (orderResult.rows[0].max || 0) + 1;
    
    const result = await db.query(
      'INSERT INTO scenes (chapter_id, content, scene_order) VALUES ($1, $2, $3) RETURNING *',
      [chapterId, content, nextOrder]
    );
    return result.rows[0];
  },

  async getById(id) {
    const result = await db.query('SELECT * FROM chapters WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updateSummary(id, summary) {
    return await db.query('UPDATE chapters SET summary = $1 WHERE id = $2', [summary, id]);
  },

  async getChildren(parentId) {
    const result = await db.query('SELECT * FROM chapters WHERE parent_id = $1 ORDER BY created_at ASC', [parentId]);
    return result.rows;
  }
};

module.exports = Chapter;
