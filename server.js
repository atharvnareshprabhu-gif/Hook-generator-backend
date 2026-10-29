const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Environment variables se security secrets aur OpenAI key uthayenge
const APP_SECRET = process.env.APP_SECRET || "hookcraft_secure_key_123"; 
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Health check route
app.get('/', (req, res) => {
    res.json({ status: "HookCraft AI OpenAI Backend is live and running!" });
});

// Hook Generation Endpoint
app.post('/api/generate-hook', async (req, res) => {
    try {
        // 1. Security Header Check
        const clientSecret = req.headers['x-app-secret'];
        if (!clientSecret || clientSecret !== APP_SECRET) {
            return res.status(403).json({ error: "Access Denied: Invalid or missing app secret." });
        }

        const { topic, tone, platform } = req.body;
        if (!topic) {
            return res.status(400).json({ error: "Topic is required!" });
        }

        // 2. OpenAI Prompt Construction
        const prompt = `Generate 3 high-retention viral ${platform || 'Instagram Reels'} hooks for the topic: "${topic}" with a ${tone || 'Contrarian'} tone. Make them catchy, engaging, and optimized for Indian creators.`;

        // 3. API Call to OpenAI
        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", // Fast, cheap, and very high quality
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const aiData = await aiResponse.json();
        
        if (!aiResponse.ok) {
            throw new Error(aiData.error?.message || "Failed to fetch from OpenAI provider");
        }

        const generatedText = aiData.choices[0].message.content;

        // 4. Send response back to frontend
        res.json({ success: true, hooks: generatedText });

    } catch (err) {
        console.error("Error generating hook:", err);
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
