const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'GEMINI';
    if (this.provider === 'GEMINI') {
      console.log("[AI] Initializing Gemini 3.1 Flash Lite (2026 Release)...");
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      // Switching to the March 2026 flagship model
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite-preview" 
      }, { apiVersion: 'v1beta' });
    }
  }

  async generateProse(prompt, context = '') {
    console.log(`[AI] Generating Prose for: "${prompt.substring(0, 50)}..."`);
    if (this.provider === 'GEMINI') {
      try {
        const fullPrompt = `Context: ${context}\n\nUser Action/Goal: ${prompt}\n\nWrite the next 3-4 paragraphs of the story in a professional literary style:`;
        const result = await this.model.generateContent(fullPrompt);
        const text = result.response.text();
        if (!text) throw new Error('Gemini returned empty prose');
        console.log(`[AI] Prose Generated Successfully (${text.length} chars)`);
        return text;
      } catch (err) {
        console.error('[AI] Gemini Prose Error Detail:', JSON.stringify(err, null, 2));
        console.error('[AI] Error Message:', err.message);
        return "The storyteller's mind clouded for a moment, but the journey must continue... (AI Error fallback)";
      }
    }
  }

  async generateChoices(content) {
    console.log(`[AI] Generating Choices for content (${content.length} chars)`);
    if (this.provider === 'GEMINI') {
      try {
        const prompt = `Based on the following story chapter, generate 3 distinct choice buttons for the reader to continue the story:\n\n${content}\n\nReturn the choices as a simple JSON array of strings.`;
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        console.log(`[AI] Choices raw response:`, text);
        
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        if (start === -1 || end === -1) throw new Error('No JSON array found in response');
        
        const choices = JSON.parse(text.substring(start, end + 1));
        console.log(`[AI] Choices parsed:`, choices);
        return choices;
      } catch (err) {
        console.error('[AI] Gemini Choices Error:', err.message);
        return ["Continue exploring", "Try another path", "Wait for someone"];
      }
    }
  }
}

module.exports = new AIService();
