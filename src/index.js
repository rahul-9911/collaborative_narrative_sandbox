const express = require('express');
const cors = require('cors');
const storyRoutes = require('./api/routes/story.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', storyRoutes);

// Root route for health check
app.get('/health', (req, res) => {
  res.json({ status: 'StoryForge Engine Operational', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`StoryForge Server running on port ${PORT}`);
});
