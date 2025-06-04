// file upload stuff
const fs = require('fs');
const uploadDir = './public/uploads'; //bc it cant find its directory dawg just look its right there
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
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

// message sending stuff that keeps breaking brooooooooo
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
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
  console.log('user connected');

  socket.on('user-online', (username) => {
    usersOnline.add(username);
    io.emit('user-status', { user: username, status: 'online' });
  });

  socket.on('user-offline', (username) => {
    usersOnline.delete(username);
    io.emit('user-status', { user: username, status: 'offline' });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  // detects that someones pfp changed
  socket.on('avatar-updated', (username) => {
    io.emit('avatar-updated', username);
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