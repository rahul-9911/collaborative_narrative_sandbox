const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: The Node SDK currently uses v1 internally. We can check what it sees.
    console.log("Checking available models for your API key...");
    
    // We'll try to generate a tiny bit of content with the most likely candidates
    const candidates = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-8b'];
    
    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        console.log(`✅ Model SUCCESS: ${modelName}`);
        process.exit(0);
      } catch (err) {
        console.log(`❌ Model FAILED: ${modelName} - ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Fatal Error:", err.message);
  }
}

listModels();
