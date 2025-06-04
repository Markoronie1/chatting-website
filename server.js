// file upload stuff
const multer = require('multer');
const path = require('path');

// express server stuff
const express = require('express');
const fs = require('fs');
const http = require('http');
const app = express();

// socketIO stuff
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);
const PORT = 3000;

// message sending stuff
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
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
  // detects that other pfp changed
  socket.on('avatar-updated', (username) => {
    io.emit('avatar-updated', username);
  });
});

// file storage stuff
const uploadDir = './public/uploads'; // pls acc see the folder bro its right there
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    // if username is undefined
    const rawName = req.body.username || 'unknown';
    const safeName = rawName.toLowerCase().replace(/[^a-z0-9]/gi, '_'); //dont crash out unc
    const ext = '.png';
    cb(null, `${safeName}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG and JPEG files are allowed.'));
    }
  }
}).single('avatar');

// file upload stuff
app.post('/api/upload-avatar', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(500).json({ error: 'Upload failed' });
    }

    console.log('upload detected'); //i better see ts every single time bro stop crashing out
    console.log('username:', req.body.username);
    console.log('file:', req.file);

    res.json({ message: 'Uploaded successfully', filename: req.file.filename });
  });
});
