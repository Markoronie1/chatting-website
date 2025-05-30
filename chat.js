const messages = [];

let currentUser = 'user1';

// emoji button to switch users (change to login system later or sum, add acc workign emojis)
document.getElementById('emojiBtn').addEventListener('click', () => {
  if (currentUser === 'user1') {
  currentUser = 'user2';
} else {
  currentUser = 'user1';
}
  alert(`Switched to ${currentUser}`);
});


const chatBox = document.getElementById('chatBox');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');

function renderMessages() {
  chatBox.innerHTML = ''; // clears all messages

  messages.forEach((msg, index) => { //ts then repopulates
    const messageEl = document.createElement('div');
    if (msg.user === 'user1') {
        messageEl.className = 'message right';
    } else {
        messageEl.className = 'message left';
    }

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.text;
    messageEl.appendChild(bubble);

    const isLastInGroup = index === messages.length - 1 || messages[index + 1].user !== msg.user; //if last or diff user
    if (isLastInGroup) {
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      messageEl.appendChild(avatar);
    }

    chatBox.appendChild(messageEl);
  });
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (text === ''){
    return;
  }

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
