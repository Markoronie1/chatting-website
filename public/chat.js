const socket = io();

let currentUser = 'user1';

document.getElementById('emojiBtn').addEventListener('click', () => {
  currentUser = currentUser === 'user1' ? 'user2' : 'user1';
  alert(`Switched to ${currentUser}`);
});

const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

function renderMessages(messages) {
  chatBox.innerHTML = '';

  messages.forEach((msg, index) => {
    const messageEl = document.createElement('div');
    messageEl.className = msg.user === 'user1' ? 'message right' : 'message left';

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.text;
    messageEl.appendChild(bubble);

    const isLastInGroup = index === messages.length - 1 || messages[index + 1].user !== msg.user;
    if (isLastInGroup) {
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      messageEl.appendChild(avatar);
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

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, text })
    });

    messageInput.value = '';
    //loadMessages();
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

loadMessages();



socket.on('new-message', (message) => {
  loadMessages();
});
