const Story = require('../../models/story.model');
const Chapter = require('../../models/chapter.model');
const ai = require('../../services/ai.service');

// @desc Create a new story world
exports.createStory = async (req, res) => {
  try {
    const story = await Story.create(req.body);
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create story', details: err.message });
  }
};

// @desc Fetch all stories
exports.getStories = async (req, res) => {
  try {
    const stories = await Story.getAll();
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stories' });
  }
};

// @desc Fetch all 'leaf' chapters (ends of branches) for a story
exports.getBranches = async (req, res) => {
  try {
    const branches = await Chapter.getLeafNodes(req.params.id);
    res.json(branches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch story branches' });
  }
};

// @desc Fetch chapters with their ordered scenes
exports.getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.getByStoryId(req.params.id);
    res.json(chapters);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chapters and scenes' });
  }
};

// @desc Create a new chapter (starts with Scene 1)
exports.createChapter = async (req, res) => {
  const { title, content, parent_id } = req.body;
  try {
    const chapter = await Chapter.create({ 
      story_id: req.params.id, 
      title, 
      content, 
      parent_id 
    });
    
    // Background Trigger: Summarize the PARENT chapter now that it's closed
    if (parent_id) {
      summarizeChapterInBackground(parent_id, req.body.metadata);
    }

    res.status(201).json(chapter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create chapter with scene' });
  }
};

// Helper function for background processing
async function summarizeChapterInBackground(chapterId, metadata) {
  try {
    const chapter = await Chapter.getById(chapterId);
    if (!chapter || chapter.summary) return; // already summarized

    console.log(`[Chronicler] Summarizing Chapter: ${chapter.title}...`);
    const summary = await ai.generateSummary(chapter.content, metadata);
    
    // Save summary back to DB via Model
    await Chapter.updateSummary(chapterId, summary);
    console.log(`[Chronicler] Chapter ${chapterId} successfully summarized.`);
  } catch (err) {
    console.error('[Chronicler] Background Summarization failed:', err.message);
  }
}

// @desc Fork a chapter (starts with Scene 1 of the new chapter)
exports.forkChapter = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const parent = await Chapter.getById(id);
    if (!parent) return res.status(404).json({ error: 'Parent not found' });
    
    const chapter = await Chapter.create({ 
      story_id: parent.story_id, 
      title, 
      content, 
      parent_id: id 
    });
    res.status(201).json(chapter);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fork chapter with scene' });
  }
};

// @desc Add a scene to an existing chapter (extends chapter length)
exports.addScene = async (req, res) => {
  const { content } = req.body;
  const { chapterId } = req.params;
  try {
    const scene = await Chapter.addScene(chapterId, content);
    res.status(201).json(scene);
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
