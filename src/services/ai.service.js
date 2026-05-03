const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'GEMINI'; 
    this.localUrl = process.env.LOCAL_AI_URL || 'http://ollama:11434';
    this.localModel = process.env.LOCAL_MODEL_NAME || 'gemma3:4b';

    if (this.provider === 'GEMINI') {
      console.log("[AI] Initializing Gemini 3.1 Flash Lite...");
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-3.1-flash-lite-preview" 
      }, { apiVersion: 'v1beta' });
    } else {
      console.log(`[AI] Initializing Local Engine (${this.localModel})...`);
    }
  }

  /**
   * Robust JSON extractor to handle local models adding conversational filler
   */
  extractJSON(text) {
    try {
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1) return null;
      const jsonStr = text.substring(start, end + 1);
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('[AI] JSON Extraction failed:', err.message);
      return null;
    }
  }

  async callLocalLLM(prompt, systemPrompt = "") {
    try {
      const response = await fetch(`${this.localUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.localModel,
          system: systemPrompt + " Return ONLY valid JSON. No conversational filler. Ensure the JSON is complete.",
          prompt: prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.8,
            num_ctx: 16384, 
            num_predict: 4096 // Doubled prediction buffer for 15+ paragraphs
          }
        }),
        signal: AbortSignal.timeout(120000) 
      });
      if (!response.ok) throw new Error(`Local AI error: ${response.statusText}`);
      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error('[AI] Local LLM Fetch Error:', err.message);
      throw err;
    }
  }

  async generateProse(prompt, context = '', metadata = {}, length = 3, needsTitle = false, attempt = 1) {
    const { genre = 'Literary Fiction', tone = 'Balanced', plot_goal = 'Not specified', chapterDepth = 1, chaptersPerStep = 2 } = metadata;
    const { TROPE_BLACKLIST, HARMON_STORY_CIRCLE } = require('../utils/NarrativeFrameworks');
    const maxAttempts = 3;

    // Convert length (Pages) to paragraphs/words
    const targetParagraphsMin = length * 4;
    const targetParagraphsMax = length * 5;
    const targetWordsMin = length * 250;
    const targetWordsMax = length * 300;

    const lengthInstruction = length === 'full' 
      ? "Write a complete, lengthy chapter (approx 10-15 paragraphs) that brings this segment of the story to a satisfying pause point."
      : `Write approximately ${targetParagraphsMin} to ${targetParagraphsMax} paragraphs (roughly ${targetWordsMin} to ${targetWordsMax} words). Ensure the volume of text matches this request exactly.`;

    const titleInstruction = needsTitle 
      ? "Also, generate a creative and evocative Title for this new chapter. Return your response as a JSON object: { \"title\": \"...\", \"prose\": \"...\" }"
      : "Return your response as a JSON object: { \"prose\": \"...\" }";

    const narrativeInstruction = HARMON_STORY_CIRCLE.getStepInstruction(chapterDepth, chaptersPerStep);
    const tropeConstraint = `BANNED WORDS: Do not use any of the following words: ${TROPE_BLACKLIST.join(', ')}. Focus on grounded, specific language.`;

    const systemPrompt = `You are a professional novelist. Genre: ${genre}. Tone: ${tone}.`;
    const fullPrompt = `
STORY BIBLE:
- Plot Goal: ${plot_goal}

${narrativeInstruction}
${tropeConstraint}

CONTEXT OF PREVIOUS CHAPTERS:
${context}

USER ACTION/GOAL:
${prompt}

INSTRUCTIONS:
${lengthInstruction}
${titleInstruction}
Adhere strictly to the Genre, Tone, and Director's Constraints. Ensure the prose moves the story meaningfully toward the Plot Goal without rushing.
Return ONLY the JSON object. No other text.
`;

    try {
      let text;
      if (this.provider === 'GEMINI') {
        const result = await this.model.generateContent(fullPrompt);
        text = result.response.text();
      } else {
        text = await this.callLocalLLM(fullPrompt, systemPrompt);
      }

      const data = this.extractJSON(text);
      if (!data) throw new Error('Invalid JSON format from AI');
      return data;

    } catch (err) {
      const isTransient = err.message.includes('503') || err.message.includes('500') || err.message.includes('overloaded') || err.message.includes('JSON');
      if (isTransient && attempt < maxAttempts) {
        const delay = attempt * 1000;
        console.warn(`[AI] Retry attempt ${attempt + 1} for ${this.provider}...`);
        await sleep(delay);
        return this.generateProse(prompt, context, metadata, length, needsTitle, attempt + 1);
      }
      throw err;
    }
  }

  async generateChoices(content, metadata = {}, attempt = 1) {
    const { genre = 'Literary Fiction' } = metadata;
    const maxAttempts = 3;
    const systemPrompt = `You are a creative narrative designer.`;
    const prompt = `Based on the following ${genre} story chapter, generate 3 distinct choice buttons for the reader to continue the story:\n\n${content}\n\nReturn the choices as a simple JSON array of strings. Ensure choices align with themes.`;

    try {
      let text;
      if (this.provider === 'GEMINI') {
        const result = await this.model.generateContent(prompt);
        text = result.response.text();
      } else {
        text = await this.callLocalLLM(prompt, systemPrompt);
      }

      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error('Invalid Array format');
      return JSON.parse(text.substring(start, end + 1));
    } catch (err) {
      if (attempt < maxAttempts) {
        await sleep(attempt * 1000);
        return this.generateChoices(content, metadata, attempt + 1);
      }
      throw err;
    }
  }

  async generateSummary(content, metadata = {}) {
    const { genre = 'Fiction' } = metadata;
    const prompt = `Condense the following ${genre} story chapter into a single, punchy paragraph that captures the most important plot events and character shifts for long-term memory:\n\n${content}\n\nReturn ONLY the summary paragraph. No conversational filler.`;

    try {
      if (this.provider === 'GEMINI') {
        const result = await this.model.generateContent(prompt);
        return result.response.text();
      } else {
        return await this.callLocalLLM(prompt, "You are a master literary summarizer.");
      }
    } catch (err) {
      console.error('[AI] Summarization Error:', err.message);
      return "The journey continued..."; // Fallback summary
    }
  }
}

module.exports = new AIService();
