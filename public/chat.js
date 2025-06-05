const socket = io();
let currentUser = null;

const avatarForm = document.getElementById('avatarForm');
const triggerUpload = document.getElementById('triggerUpload');
const avatarFile = document.getElementById('avatarFile');

const loginPopup = document.getElementById('loginPopup');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('usernameInput');
const logoutBtn = document.getElementById('logoutBtn');
const chatContainer = document.querySelector('.chat-container');
const avatarBtn = document.getElementById('avatarButton');
const avatarPopup = document.getElementById('avatarPopup');
const closePopupBtn = document.getElementById('closeAvatarPopup');

loginBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return;

  currentUser = name;
  localStorage.setItem('username', name);
  socket.emit('user-online', name);

  loginPopup.style.display = 'none';
  chatContainer.style.display = 'flex';
  avatarBtn.style.display = 'block';

  const avatarFile = `${currentUser.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.png`;
  avatarBtn.style.backgroundImage = `url('/uploads/${avatarFile}?${Date.now()}')`;
  avatarBtn.style.backgroundSize = 'cover';
  avatarBtn.style.backgroundPosition = 'center';

  loadMessages();
});

logoutBtn.addEventListener('click', () => {
  socket.emit('user-offline', currentUser);
  localStorage.removeItem('username');
  location.reload();
});

window.addEventListener('beforeunload', () => {
  socket.emit('user-offline', currentUser);
});

function renderMessages(messages) {
  chatBox.innerHTML = '';
  messages.forEach((msg, index) => {
    const messageEl = document.createElement('div');
    messageEl.className = msg.user === currentUser ? 'message right' : 'message left';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.text;
    messageEl.appendChild(bubble);

    const isLastInGroup = index === messages.length - 1 || messages[index + 1].user !== msg.user;
    if (isLastInGroup) {
      const avatar = document.createElement('div');
      avatar.className = 'avatar';

      const avatarFile = `${msg.user.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.png`;
      avatar.style.backgroundImage = `url('/uploads/${avatarFile}?${Date.now()}')`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';

      const label = document.createElement('div');
      label.innerText = msg.user;
      label.style.fontSize = '12px';
      messageEl.appendChild(avatar);
      messageEl.appendChild(label);
    }

    chatBox.appendChild(messageEl);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadMessages() {
  try {
    const res = await fetch('/api/messages');
    const data = await res.json();
    renderMessages(data);
  } catch (err) {
    console.error('Failed to load messages:', err);
  }
}

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;

  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, text })
    });
    messageInput.value = '';
  } catch (err) {
    console.error('Failed to send message:', err);
  }
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendBtn.click();
});

socket.on('new-message', () => loadMessages());

window.addEventListener('load', () => {
  const savedUser = localStorage.getItem('username');
  if (savedUser) {
    currentUser = savedUser;
    socket.emit('user-online', savedUser);
    loginPopup.style.display = 'none';
    chatContainer.style.display = 'flex';
    avatarBtn.style.display = 'block';

    const avatarFile = `${currentUser.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.png`;
    avatarBtn.style.backgroundImage = `url('/uploads/${avatarFile}?${Date.now()}')`;
    avatarBtn.style.backgroundSize = 'cover';
    avatarBtn.style.backgroundPosition = 'center';

    loadMessages();
  } else {
    loginPopup.style.display = 'flex';
  }
});

avatarBtn.addEventListener('click', () => {
  avatarPopup.style.display = avatarPopup.style.display === 'none' ? 'block' : 'none';
});

closePopupBtn.addEventListener('click', () => {
  avatarPopup.style.display = 'none';
});

triggerUpload.addEventListener('click', () => {
  avatarFile.click();
});

avatarFile.addEventListener('change', async () => {
  const file = avatarFile.files[0];
  if (!file || !currentUser) return;

  document.getElementById('uploadUsername').value = currentUser;

  const formData = new FormData(document.getElementById('avatarForm'));

  console.log('Uploading avatar for', currentUser);

  try {
    const res = await fetch('/api/upload-avatar', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.filename && data.username) {
      if (data.username === currentUser) {
        avatarBtn.style.backgroundImage = `url('/uploads/${data.filename}?${Date.now()}')`;
        avatarBtn.style.backgroundSize = 'cover';
        avatarBtn.style.backgroundPosition = 'center';
      }
    }

    socket.emit('avatar-updated', currentUser);
    loadMessages();
  } catch (err) {
    console.error('Upload failed:', err);
  }
});

socket.on('avatar-updated', (user) => {
  loadMessages();
});
