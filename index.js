const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/generate', async (req, res) => {
  try {
    const { text, audioType, voiceName, download, pitch } = req.body;
    if (!text) {
      return res.status(400).send('Text parameter is required');
    }

    const params = new URLSearchParams();
    params.append('text', text);
    if (audioType) params.append('audioType', audioType);
    if (voiceName) params.append('voiceName', voiceName);
    if (download) params.append('download', download);
    if (pitch) params.append('pitch', pitch);

    const url = `http://localhost:8080/api/tts?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch speech data');
    }

    const audioData = await response.arrayBuffer();
    res.set('Content-Type', 'audio/mpeg');
    res.send(Buffer.from(audioData));
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).send('Error processing request: ' + error.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
