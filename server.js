const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.get('/', (req, res) => {
    res.json({ status: "HookCraft AI Backend is live!" });
});

app.post('/api/generate-hook', async (req, res) => {
    try {
        const { topic, tone, platform } = req.body;
        if (!topic) {
            return res.status(400).json({ error: "Topic is required!" });
        }

        const prompt = `Generate 3 high-retention viral ${platform || 'Instagram Reels'} hooks for the topic: "${topic}" with a ${tone || 'Contrarian'} tone. Make them catchy, engaging, and optimized for Indian creators.`;

        const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            })
        });

        const aiData = await aiResponse.json();
        
        if (!aiResponse.ok) {
            throw new Error(aiData.error?.message || "Failed to fetch from OpenAI");
        }

        res.json({ success: true, hooks: aiData.choices[0].message.content });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ error: "Server Error", details: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
