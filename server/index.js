require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/translater-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Translation Schema
const translationSchema = new mongoose.Schema({
  sourceText: String,
  translatedText: String,
  sourceLanguage: String,
  targetLanguage: String,
  timestamp: { type: Date, default: Date.now }
});

const Translation = mongoose.model('Translation', translationSchema);

// API Routes
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang, targetLang } = req.body;
    
    // Call MyMemory Translation API
    const response = await axios.get(`https://api.mymemory.translated.net/get`, {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`
      }
    });

    if (!response.data || !response.data.responseData || !response.data.responseData.translatedText) {
      throw new Error('Invalid response from translation service');
    }

    const translatedText = response.data.responseData.translatedText;

    // Save to database
    const translation = new Translation({
      sourceText: text,
      translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      timestamp: new Date()
    });
    
    await translation.save();

    res.json({ translation: translatedText });
  } catch (error) {
    console.error('Translation error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Translation failed', 
      details: error.message 
    });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const translations = await Translation.find()
      .sort({ timestamp: -1 })
      .limit(10);
    res.json(translations);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 