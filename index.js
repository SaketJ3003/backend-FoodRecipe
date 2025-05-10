const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express();
const upload = multer({ dest: 'uploads/' });


app.use(cors());
app.use(express.json());
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// API endpoint to accept uploaded image
app.post('/api/recipe', upload.single('image'), async (req, res) => {
    console.log('Image received:', req.file?.originalname);
    const imagePath = req.file.path;

    try {
        const base64Image = fs.readFileSync(imagePath, { encoding: 'base64' });
        console.log('Base64 image created');

        const geminiRes = await axios.post(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
            {
                contents: [
                    {
                        parts: [
                            { text: 'Generate a recipe from this food image. Include ingredients and preparation steps:' },
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
                params: {
                    key: process.env.GEMINI_API_KEY,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Get recipe text from Gemini response
        const recipeText = geminiRes.data.candidates[0].content.parts[0].text;

        // Return recipe to frontend
        res.json({ recipe: recipeText });

    } catch (err) {
        console.error('Error from Gemini:', err.response?.data || err.message);
        res.status(500).json({ error: 'Failed to generate recipe' });
    } finally {
        // Delete the temporary uploaded file
        fs.unlinkSync(imagePath);
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));
