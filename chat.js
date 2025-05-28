// === chat.js ===

// Chat message list
const messages = [];

// Current user — switch between 'user1' and 'user2' manually for now
let currentUser = 'user1';

// DOM elements
const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

// Render messages
function renderMessages() {
  chatBox.innerHTML = ''; // Clear existing messages
  messages.forEach(msg => {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${msg.user === 'user1' ? 'right' : 'left'}`;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.text;

    const avatar = document.createElement('div');
    avatar.className = 'avatar';

    if (msg.user === 'user1') {
      messageEl.appendChild(bubble);
      messageEl.appendChild(avatar);
    } else {
      messageEl.appendChild(avatar);
      messageEl.appendChild(bubble);
    }

    chatBox.appendChild(messageEl);
  });

  // Scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Send message
function sendMessage() {
  const text = messageInput.value.trim();
  if (text === '') return;

  messages.push({
    user: currentUser,
    text
  });

  messageInput.value = '';
  renderMessages();
}

// Handle send button click
sendBtn.addEventListener('click', sendMessage);

// Handle Enter key
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

// For now, press emoji button to switch user
document.getElementById('emojiBtn').addEventListener('click', () => {
  currentUser = currentUser === 'user1' ? 'user2' : 'user1';
  alert(`Switched to ${currentUser}`);
});
