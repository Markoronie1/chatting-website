const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const FILE_PATH = './messages.json';

let messages = [];
if (fs.existsSync(FILE_PATH)) {
  messages = JSON.parse(fs.readFileSync(FILE_PATH));
}

app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { user, text } = req.body;
  const message = { user, text };
  messages.push(message);
  fs.writeFileSync(FILE_PATH, JSON.stringify(messages, null, 2));
  res.status(201).json(message);
});

app.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
