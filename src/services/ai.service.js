const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'GEMINI';
    if (this.provider === 'GEMINI') {
      console.log("[AI] Initializing Gemini 3.1 Flash Lite (2026 Release)...");
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite-preview" 
      }, { apiVersion: 'v1beta' });
    }
  }

  async generateProse(prompt, context = '', metadata = {}) {
    const { genre = 'Literary Fiction', tone = 'Balanced', plot_goal = 'Not specified' } = metadata;
    
    console.log(`[AI] Generating ${genre} Prose (${tone} tone)...`);
    
    if (this.provider === 'GEMINI') {
      try {
        const fullPrompt = `
STORY BIBLE:
- Genre: ${genre}
- Tone: ${tone}
- Overall Plot Goal: ${plot_goal}

CONTEXT OF PREVIOUS CHAPTER:
${context}

USER ACTION/GOAL:
${prompt}

INSTRUCTIONS:
Write the next 3-4 paragraphs of the story. 
Adhere strictly to the Genre and Tone. 
Ensure the prose moves the story meaningfully toward the Plot Goal.
Avoid repetitive descriptions.
`;
        const result = await this.model.generateContent(fullPrompt);
        const text = result.response.text();
        if (!text) throw new Error('Gemini returned empty prose');
        return text;
      } catch (err) {
        console.error('[AI] Gemini Prose Error:', err.message);
        return "The storyteller's mind clouded for a moment... (AI Error fallback)";
      }
    }
  }

  async generateChoices(content, metadata = {}) {
    const { genre = 'Literary Fiction' } = metadata;
    console.log(`[AI] Generating Choices for ${genre} story...`);
    
    if (this.provider === 'GEMINI') {
      try {
        const prompt = `Based on the following ${genre} story chapter, generate 3 distinct choice buttons for the reader to continue the story:\n\n${content}\n\nReturn the choices as a simple JSON array of strings. Ensure choices align with the story's themes.`;
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start === -1 || end === -1) throw new Error('No JSON array found');
        return JSON.parse(text.substring(start, end + 1));
      } catch (err) {
        console.error('[AI] Gemini Choices Error:', err.message);
        return ["Continue exploring", "Try another path", "Wait for someone"];
      }
    }
  }
}

module.exports = new AIService();
