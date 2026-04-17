/**
 * api.service.js - Centralized API handler for StoryForge
 */

const handleResponse = async (res) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'The storyteller is temporarily unavailable.');
  }
  return res.json();
};

export const api = {
  // World Management
  async getStories() {
    const res = await fetch('/api/stories');
    return handleResponse(res);
  },

  async getStoryBySlug(slug) {
    const res = await fetch(`/api/stories/slug/${slug}`);
    return handleResponse(res);
  },

  async createStory(storyData) {
    const res = await fetch('/api/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(storyData)
    });
    return handleResponse(res);
  },

  // Narrative Fetching
  async getChapters(storyId) {
    const res = await fetch(`/api/stories/${storyId}/chapters`);
    return handleResponse(res);
  },

  async getBranches(storyId) {
    const res = await fetch(`/api/stories/${storyId}/branches`);
    return handleResponse(res);
  },

  // Drafting Logic
  async generateAI({ prompt, context, metadata, length, needsTitle }) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context, metadata, length, needsTitle })
    });
    return handleResponse(res);
  },

  async generateChoices({ content, metadata }) {
    const res = await fetch('/api/generate/choices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, metadata })
    });
    return handleResponse(res);
  },

  // Persistence Logic
  async saveChapter(storyId, chapterData) {
    const res = await fetch(`/api/stories/${storyId}/chapters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chapterData)
    });
    return handleResponse(res);
  },

  async forkChapter(chapterId, forkData) {
    const res = await fetch(`/api/chapters/${chapterId}/fork`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(forkData)
    });
    return handleResponse(res);
  },

  async addScene(chapterId, sceneData) {
    const res = await fetch(`/api/chapters/${chapterId}/scenes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sceneData)
    });
    return handleResponse(res);
  }
};
