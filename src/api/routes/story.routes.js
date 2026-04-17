const express = require('express');
const router = express.Router();
const controller = require('../controllers/story.controller');

// Story routes
router.post('/stories', controller.createStory);
router.get('/stories', controller.getStories);
router.get('/stories/slug/:slug', controller.getStoryBySlug);
router.get('/stories/:id/branches', controller.getBranches);
router.get('/stories/:id/chapters', controller.getChapters);
router.post('/stories/:id/chapters', controller.createChapter);

// Fork route
router.post('/chapters/:id/fork', controller.forkChapter);

// Scene route
router.post('/chapters/:chapterId/scenes', controller.addScene);

// AI routes
router.post('/generate', controller.generateAI);
router.post('/generate/choices', controller.generateChoices);

module.exports = router;
