const socket = io();
let currentUser = null;

const loginPopup = document.getElementById('loginPopup');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('usernameInput');
const logoutBtn = document.getElementById('logoutBtn');
const chatContainer = document.querySelector('.chat-container');

loginBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return;

  currentUser = name;
  localStorage.setItem('username', name);
  socket.emit('user-online', name);

  loginPopup.style.display = 'none';
  chatContainer.style.display = 'flex';
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
    loadMessages();
  }
});
