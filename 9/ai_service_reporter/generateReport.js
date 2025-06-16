require('dotenv').config();
const { OpenAI } = require('openai');
const { generatePrompt } = require('./promptTemplate');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getReport(inputText) {
  const prompt = generatePrompt(inputText);

  const chat = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  return chat.choices[0].message.content;
}

module.exports = { getReport };
