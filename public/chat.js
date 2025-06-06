const socket = io();
let currentUser = null;

// sets constants based on ids used in index.html
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

// login logic:
loginBtn.addEventListener('click', () => {
  // takes in given username
  const name = usernameInput.value.trim();
  if (!name) return;

  currentUser = name;
  localStorage.setItem('username', name);
  // sets user as online
  socket.emit('user-online', name);

  // hides login popup, shows chat and profile button
  loginPopup.style.display = 'none';
  chatContainer.style.display = 'flex';
  avatarBtn.style.display = 'block';

  // tries to set custom pfp
  const avatarFile = `${currentUser.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.png`;
  avatarBtn.style.backgroundImage = `url('/uploads/${avatarFile}?${Date.now()}')`;
  avatarBtn.style.backgroundSize = 'cover';
  avatarBtn.style.backgroundPosition = 'center';

  loadMessages();
});

// logout button clears username and reload page
logoutBtn.addEventListener('click', () => {
  socket.emit('user-offline', currentUser);
  localStorage.removeItem('username');
  location.reload();
});

// sets user as offline before reloading/unloading the page
window.addEventListener('beforeunload', () => {
  socket.emit('user-offline', currentUser);
});

// message showing logic:
function renderMessages(messages) {
  // clears the box
  chatBox.innerHTML = '';
  // loops through the array with all the messages
  messages.forEach((msg, index) => {
    const messageEl = document.createElement('div');
    // determines if the message should be on the left or right
    //messageEl.className = msg.user === currentUser ? 'message right' : 'message left';

    if(msg.user === currentUser){
      messageEl.className = 'message right'
    } else {
      messageEl.className = 'message left'
    }

    // makes chat bubble element with text inside
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerText = msg.text;
    messageEl.appendChild(bubble);

    // show avatar logic:
    const isLastInGroup = index === messages.length - 1 || messages[index + 1].user !== msg.user;
    if (isLastInGroup) {
      // creates avatar element
      const avatar = document.createElement('div');
      avatar.className = 'avatar';

      // sets photo to custom photo
      const avatarFile = `${msg.user.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.png`;
      avatar.style.backgroundImage = `url('/uploads/${avatarFile}?${Date.now()}')`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      
      // add usrname
      const label = document.createElement('div');
      label.innerText = msg.user;
      label.style.fontSize = '12px';
      messageEl.appendChild(avatar);
      messageEl.appendChild(label);
    }

    chatBox.appendChild(messageEl);
  });
  // after loading all message, scroll to bottom of chat
  chatBox.scrollTop = chatBox.scrollHeight;
}

// provides the message data for renderMessages
async function loadMessages() {
  try {
    const res = await fetch('/api/messages');
    const data = await res.json();
    renderMessages(data);
  } catch (err) {
    // thankfully hasnt happened so for pls dont happen bro
    console.error('Failed to load messages: ', err);
  }
}

// send button logic:
sendBtn.addEventListener('click', async () => {
  // removes unnessary spaces
  const text = messageInput.value.trim();
  // in case user status is glitched
  if (!text || !currentUser) return;

  // sends message data (username and text) to the server
  try {
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: currentUser, text })
    });
    messageInput.value = '';
  } catch (err) {
    console.error('Failed to send message: ', err);
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
