const db = require('../../config/db');
const ai = require('../../services/ai.service');

// @desc Create a new story world
exports.createStory = async (req, res) => {
  const { title, description, metadata } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO stories (title, description, metadata) VALUES ($1, $2, $3) RETURNING *',
      [title, description, metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create story', details: err.message });
  }
};

// @desc Fetch all stories
exports.getStories = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM stories ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

// @desc Fetch all 'leaf' chapters (ends of branches) for a story
exports.getBranches = async (req, res) => {
  try {
    const query = `
      SELECT c.* FROM chapters c
      WHERE c.story_id = $1
      AND NOT EXISTS (SELECT 1 FROM chapters child WHERE child.parent_id = c.id)
      ORDER BY c.created_at DESC
    `;
    const result = await db.query(query, [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch story branches' });
  }
};

// @desc Fetch chapters with their ordered scenes
exports.getChapters = async (req, res) => {
  try {
    // 1. Fetch chapters
    const chaptersResult = await db.query('SELECT * FROM chapters WHERE story_id = $1', [req.params.id]);
    const chapters = chaptersResult.rows;

    // 2. Fetch all scenes for these chapters
    const scenesResult = await db.query(
      'SELECT * FROM scenes WHERE chapter_id IN (SELECT id FROM chapters WHERE story_id = $1) ORDER BY scene_order ASC', 
      [req.params.id]
    );
    const scenes = scenesResult.rows;

    // 3. Attach scenes to chapters
    const combined = chapters.map(chapter => ({
      ...chapter,
      scenes: scenes.filter(s => s.chapter_id === chapter.id)
    }));

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapters and scenes' });
  }
};

// @desc Create a new chapter (starts with Scene 1)
exports.createChapter = async (req, res) => {
  const { title, content, parent_id } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create Chapter with optional parent_id
    const chapResult = await client.query(
      'INSERT INTO chapters (story_id, title, content, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.id, title, content, parent_id || null]
    );
    const chapter = chapResult.rows[0];

    // Create First Scene
    await client.query(
      'INSERT INTO scenes (chapter_id, content, scene_order) VALUES ($1, $2, 1)',
      [chapter.id, content]
    );

    await client.query('COMMIT');
    res.status(201).json({ ...chapter, scenes: [{ content, scene_order: 1 }] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to create chapter with scene' });
  } finally {
    client.release();
  }
};

// @desc Fork a chapter (starts with Scene 1 of the new chapter)
exports.forkChapter = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const parent = await client.query('SELECT story_id FROM chapters WHERE id = $1', [id]);
    if (parent.rows.length === 0) throw new Error('Parent not found');
    
    const story_id = parent.rows[0].story_id;

    const chapResult = await client.query(
      'INSERT INTO chapters (story_id, parent_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
      [story_id, id, title, content]
    );
    const chapter = chapResult.rows[0];

    await client.query(
      'INSERT INTO scenes (chapter_id, content, scene_order) VALUES ($1, $2, 1)',
      [chapter.id, content]
    );

    await client.query('COMMIT');
    res.status(201).json({ ...chapter, scenes: [{ content, scene_order: 1 }] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Failed to fork chapter with scene' });
  } finally {
    client.release();
  }
};

// @desc Add a scene to an existing chapter (extends chapter length)
exports.addScene = async (req, res) => {
  const { content } = req.body;
  const { chapterId } = req.params;
  try {
    const orderResult = await db.query('SELECT MAX(scene_order) FROM scenes WHERE chapter_id = $1', [chapterId]);
    const nextOrder = (orderResult.rows[0].max || 0) + 1;
    
    const result = await db.query(
      'INSERT INTO scenes (chapter_id, content, scene_order) VALUES ($1, $2, $3) RETURNING *',
      [chapterId, content, nextOrder]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add scene' });
  }
};

// @desc Core AI generation (Prose + Choices)
exports.generateAI = async (req, res) => {
  const { prompt, context, metadata, length, needsTitle } = req.body;
  try {
    const aiResponse = await ai.generateProse(prompt, context, metadata, length, needsTitle);
    const choices = await ai.generateChoices(aiResponse.prose, metadata);
    res.json({ 
      title: aiResponse.title, 
      prose: aiResponse.prose, 
      choices 
    });
  } catch (err) {
    console.error('[Controller] AI Generation Error:', err.message);
    res.status(503).json({ 
      error: 'The storyteller is temporarily unavailable.', 
      details: err.message 
    });
  }
};

// @desc Helper to generate choices for existing content
exports.generateChoices = async (req, res) => {
  const { content, metadata } = req.body;
  try {
    const choices = await ai.generateChoices(content, metadata);
    res.json({ choices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate choices' });
  }
};
