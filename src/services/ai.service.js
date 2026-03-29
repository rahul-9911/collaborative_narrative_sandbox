const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const sleep = (ms) => new Promise(res => setTimeout(ms, res));

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

  async generateProse(prompt, context = '', metadata = {}, length = 3, needsTitle = false, attempt = 1) {
    const { genre = 'Literary Fiction', tone = 'Balanced', plot_goal = 'Not specified' } = metadata;
    const maxAttempts = 3;
    
    if (this.provider === 'GEMINI') {
      try {
        const lengthInstruction = length === 'full' 
          ? "Write a complete, lengthy chapter (approx 10-15 paragraphs) that brings this segment of the story to a satisfying pause point."
          : `Write exactly ${length} paragraphs of the story.`;

        const titleInstruction = needsTitle 
          ? "Also, generate a creative and evocative Title for this new chapter. Return your response as a JSON object: { \"title\": \"...\", \"prose\": \"...\" }"
          : "Return your response as a JSON object: { \"prose\": \"...\" }";

        const fullPrompt = `
STORY BIBLE:
- Genre: ${genre}
- Tone: ${tone}
- Overall Plot Goal: ${plot_goal}

CONTEXT OF PREVIOUS CHAPTERS:
${context}

USER ACTION/GOAL:
${prompt}

INSTRUCTIONS:
${lengthInstruction}
${titleInstruction}
Adhere strictly to the Genre and Tone. 
Ensure the prose moves the story meaningfully toward the Plot Goal.
Avoid repetitive descriptions. Return ONLY the JSON object.
`;
        const result = await this.model.generateContent(fullPrompt);
        const text = result.response.text();
        
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start === -1 || end === -1) throw new Error('Invalid JSON format from AI');
        return JSON.parse(text.substring(start, end + 1));

      } catch (err) {
        const isTransient = err.message.includes('503') || err.message.includes('500') || err.message.includes('overloaded');
        
        if (isTransient && attempt < maxAttempts) {
          const delay = attempt * 2000;
          console.warn(`[AI] Transient error (503/500). Retrying attempt ${attempt + 1} in ${delay}ms...`);
          await sleep(delay);
          return this.generateProse(prompt, context, metadata, length, needsTitle, attempt + 1);
        }

        console.error(`[AI] Gemini Prose Error after ${attempt} attempts:`, err.message);
        throw err; // Throwing error instead of returning fallback prose
      }
    }
  }

  async generateChoices(content, metadata = {}, attempt = 1) {
    const { genre = 'Literary Fiction' } = metadata;
    const maxAttempts = 3;

    if (this.provider === 'GEMINI') {
      try {
        const prompt = `Based on the following ${genre} story chapter, generate 3 distinct choice buttons for the reader to continue the story:\n\n${content}\n\nReturn the choices as a simple JSON array of strings.`;
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const start = text.indexOf('[');
        const end = text.lastIndexOf(']');
        return JSON.parse(text.substring(start, end + 1));
      } catch (err) {
        const isTransient = err.message.includes('503') || err.message.includes('500');
        if (isTransient && attempt < maxAttempts) {
          await sleep(attempt * 1000);
          return this.generateChoices(content, metadata, attempt + 1);
        }
        throw err;
      }
    }
  }
}

module.exports = new AIService();
