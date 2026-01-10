const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const corsOptions = {
  origin: "https://frontend-food-recipe-eight.vercel.app",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // 🔥 FIXES CORS PREFLIGHT
app.use(express.json());

app.post('/api/recipe', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  const imagePath = req.file.path;

  try {
    const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });

    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: 'Generate a recipe from this food image. Include ingredients and preparation steps.' },
              {
                inlineData: {
                  mimeType: req.file.mimetype,
                  data: base64Image,
                },
              },
            ],
          },
        ],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const recipeText =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    res.json({ recipe: recipeText });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to generate recipe' });
  } finally {
    fs.unlinkSync(imagePath);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
