// file upload stuff
const multer = require('multer');
const path = require('path');

// express server stuff
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const http = require('http');

// socketIO stuff
const socketIO = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 3000;

// message sending stuff
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

  io.emit('new-message', message); 
  res.status(201).json(message);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


const usersOnline = new Set();

// online/offline status
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user-online', (username) => {
    usersOnline.add(username);
    io.emit('user-status', { user: username, status: 'online' });
  });

  socket.on('user-offline', (username) => {
    usersOnline.delete(username);
    io.emit('user-status', { user: username, status: 'offline' });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// file storage stuff
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    const username = req.body.username;
    const ext = path.extname(file.originalname);
    cb(null, `${username}${ext}`);
  }
});
const upload = multer({ storage });


// file upload stuff
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
  res.json({ message: 'Uploaded successfully', filename: req.file.filename });
});