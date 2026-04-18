require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Google Gemini API
const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || '').trim() });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// System prompt for the treasure hunt chatbot
const SYSTEM_INSTRUCTION = `You are an enigmatic and engaging Treasure Hunt Master for a university campus.
Your goal is to guide players through a campus treasure hunt using cryptic, creative, and location-based clues.
Keep your responses relatively short, fun, and thematic. Use a slightly mysterious or adventurous tone.

The player is currently exploring the campus. Give them clues to find common university locations (e.g., the main library, the student union building, the sports stadium, the central fountain, the oldest lecture hall).

If the player guesses the location correctly, congratulate them, give them a tiny bit of lore or a fun fact about such a place, and provide the next clue.
If they guess incorrectly or ask for a hint, give them a subtle hint without giving away the answer entirely.
Format your responses using Markdown for emphasis (e.g., bolding important words).`;

// Endpoint to handle chat
app.post('/api/chat', async (req, res) => {
    try {
        const { history, message } = req.body;
        
        // Use Gemini-2.5-flash as the primary model
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
                { role: 'model', parts: [{ text: "I understand. I am the Treasure Hunt Master. I will provide cryptic clues for campus locations and guide the player. What is the player's first action?" }] },
                ...history,
                { role: 'user', parts: [{ text: message }] }
            ],
        });

        const reply = response.text;
        res.json({ reply });
    } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        res.status(500).json({ error: "The Treasure Hunt Master is currently unavailable. Please try again later." });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
