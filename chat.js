const messages = [];

// emoji button to switch users (change to login system later or sum, add acc workign emojis)
let currentUser = 'user1';
document.getElementById('emojiBtn').addEventListener('click', () => {
  currentUser = currentUser === 'user1' ? 'user2' : 'user1';
  alert(`Switched to ${currentUser}`);
});


const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

function renderMessages() {
  chatBox.innerHTML = ''; // removes existing messages (ignoire since message are local for now, REMOVE when perm storage)
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
  chatBox.scrollTop = chatBox.scrollHeight;
}

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

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});
