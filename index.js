const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();

// ✅ Use memory storage
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());

// Optional health check
app.get('/', (req, res) => {
  res.send('Food Recipe Backend is running 🚀');
});

app.post('/api/recipe', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY missing' });
    }

    const base64Image = req.file.buffer.toString('base64');

    const geminiRes = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
      {
        contents: [
          {
            parts: [
              { text: 'Generate a recipe from this food image with ingredients and steps.' },
              {
                inlineData: {


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
