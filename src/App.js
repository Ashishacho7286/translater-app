import React, { useState, useEffect } from 'react';
import './index.css';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' }
];

function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5001/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLanguage,
          targetLang: targetLanguage,
        }),
      });
      const data = await response.json();
      setTranslatedText(data.translation);
      fetchHistory();
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedText('Error occurred during translation');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Simple Text Translator</h1>

      <div className="language-select">
        <select 
          value={sourceLanguage} 
          onChange={(e) => setSourceLanguage(e.target.value)}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <select 
          value={targetLanguage} 
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <div className="translation-box">
        <div className="textarea-container">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Enter text to translate"
          />
        </div>
        <div className="textarea-container">
          <textarea
            value={translatedText}
            readOnly
            placeholder="Translation will appear here"
          />
        </div>
      </div>

      <button 
        onClick={handleTranslate} 
        disabled={loading || !sourceText.trim()}
      >
        {loading ? 'Translating...' : 'Translate'}
      </button>

      <div className="history">
        <h2>Recent Translations</h2>
        {history.map(item => (
          <div key={item._id || `${item.timestamp}-${item.sourceText}`} className="history-item">
            <p><strong>Original:</strong> {item.sourceText}</p>
            <p><strong>Translation:</strong> {item.translatedText}</p>
            <p className="timestamp">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App; 