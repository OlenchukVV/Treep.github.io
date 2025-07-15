// Элементы
const splash = document.getElementById('splash');
const loginScreen = document.getElementById('login');
const main = document.getElementById('main');

const splashLogo = document.getElementById('splash-logo');

const loginForm = document.getElementById('login-form');
const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-msg');

const profileInfo = document.getElementById('profile-info');
const avatarImg = document.getElementById('avatar-img');
const avatarInput = document.getElementById('avatar-input');

const newNicknameInput = document.getElementById('new-nickname');
const changeNicknameBtn = document.getElementById('change-nickname-btn');
const profileMessage = document.getElementById('profile-message');
const logoutBtn = document.getElementById('logout-btn');

const tabButtons = document.querySelectorAll('#top-buttons .tab-btn');
const tabsWrapper = document.getElementById('tabs-wrapper');

const usersListDiv = document.getElementById('users-list');

const chatWindow = document.getElementById('chat-window');
const backToChatsBtn = document.getElementById('back-to-chats');
const chatWithName = document.getElementById('chat-with-name');
const messagesDiv = document.getElementById('messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

let currentChatUserId = null;
let unsubscribeMessages = null;

// --- События ---

// Splash -> Login
splashLogo.addEventListener('click', () => {
  splash.classList.remove('active');
  loginScreen.classList.add('active');
  errorMsg.textContent = '';
});

// Вход
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMsg.textContent = '';
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginForm.reset();
      // переход на основной экран произойдет в onAuthStateChanged
    })
    .catch(error => {
      errorMsg.textContent = error.message;
    });
});

// Регистрация
document.getElementById('register-btn').addEventListener('click', () => {
  errorMsg.textContent = '';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const nickname = nicknameInput.value.trim();

  if (!email || !password || !nickname) {
    errorMsg.textContent = 'Заполните все поля!';
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      return userCredential.user.updateProfile({ displayName: nickname });
    })
    .then(() => {
      errorMsg.style.color = '#8f8';
      errorMsg.textContent = 'Регистрация успешна! Теперь войдите.';
      loginForm.reset();
    })
    .catch(error => {
      errorMsg.style.color = '#f88';
      errorMsg.textContent = error.message;
    });
});

// Выход
logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Смена ника
changeNicknameBtn.addEventListener('click', () => {
  profileMessage.textContent = '';
  const newNick = newNicknameInput.value.trim();

  if (!newNick) {
    profileMessage.textContent = 'Введите новый ник!';
    return;
  }

  const user = auth.currentUser;
  if (user) {
    user.updateProfile({ displayName: newNick })
      .then(() => {
        profileMessage.textContent = 'Ник успешно обновлён!';
        profileInfo.textContent = `Ник: ${user.displayName || 'Без ника'}, Email: ${user.email}`;
        newNicknameInput.value = '';
        // Обновим данные в Firestore
        db.collection('users').doc(user.uid).set({
          nickname: newNick,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      })
      .catch(error => {
        profileMessage.textContent = 'Ошибка: ' + error.message;
      });
  }
});

// Навигация вкладок
tabButtons.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    setActiveTab(idx);
    // При возврате к чатам прячем окно чата если оно открыто
    if(idx === 1) { // Чаты
      chatWindow.style.display = 'none';
      document.getElementById('chats').style.display = 'block';
    } else {
      chatWindow.style.display = 'none';
    }
  });
});

function setActiveTab(index) {
  tabsWrapper.style.transform = `translateX(-${index * (100 / 3)}%)`;
  tabButtons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

// Загрузка списка пользователей (кроме себя)
async function loadUsersList() {
  usersListDiv.innerHTML = '';
  const user = auth.currentUser;
  if (!user) return;

  const snapshot = await db.collection('users').get();
  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.uid === user.uid) return;

    const div = document.createElement('div');
    div.textContent = data.nickname || data.email || 'Без ника';
    div.dataset.uid = doc.id;
    div.style.cursor = 'pointer';
    div.style.padding = '8px';
    div.style.borderBottom = '1px solid #444';

    div.addEventListener('click', () => {
      openChatWith(doc.id, data.nickname || data.email || 'Без ника');
    });

    usersListDiv.appendChild(div);
  });
}

// Открытие чата с пользователем
function openChatWith(uid, nickname) {
  currentChatUserId = uid;
  chatWithName.textContent = `Чат с ${nickname}`;

  document.getElementById('chats').style.display = 'none';
  chatWindow.style.display = 'flex';

  messagesDiv.innerHTML = '';

  if (unsubscribeMessages) unsubscribeMessages();

  const user = auth.currentUser;
  if (!user) return;

  const chatId = [user.uid, uid].sort().join('_');

  unsubscribeMessages = db.collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('timestamp')
    .onSnapshot(snapshot => {
      messagesDiv.innerHTML = '';
      snapshot.forEach(doc => {
        const msg = doc.data();
        const div = document.createElement('div');
        div.textContent = `${msg.from === user.uid ? 'Вы' : nickname}: ${msg.text}`;
        div.style.margin = '5px 0';
        div.style.padding = '5px 10px';
        div.style.borderRadius = '10px';
        div.style.maxWidth = '70%';
        div.style.backgroundColor = msg.from === user.uid ? '#4a90e2' : '#333';
        div.style.color = '#fff';
        div.style.alignSelf = msg.from === user.uid ? 'flex-end' : 'flex-start';
        messagesDiv.appendChild(div);
      });
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// Назад к списку чатов
backToChatsBtn.addEventListener('click', () => {
  if (unsubscribeMessages) unsubscribeMessages();
  currentChatUserId = null;
  chatWindow.style.display = 'none';
  document.getElementById('chats').style.display = 'block';
});

// Отправка сообщения
messageForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  const user = auth.currentUser;
  if (!user || !currentChatUserId) return;

  const chatId = [user.uid, currentChatUserId].sort().join('_');

  await db.collection('chats').doc(chatId).collection('messages').add({
    text,
    from: user.uid,
    to: currentChatUserId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = '';
});

// Загрузка аватара при выборе файла
avatarInput.addEventListener('change', async () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) {
    alert('Сначала войдите в аккаунт');
    return;
  }

  const storageRef = storage.ref(`avatars/${user.uid}`);

  try {
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();

    await user.updateProfile({ photoURL: downloadURL });

    avatarImg.src = downloadURL;

    alert('Аватар успешно обновлён!');
  } catch (error) {
    alert('Ошибка загрузки аватара: ' + error.message);
  }
});

// Обновляем интерфейс при изменении состояния авторизации
auth.onAuthStateChanged(async (user) => {
  if (user) {
    splash.classList.remove('active');
    loginScreen.classList.remove('active');
    main.classList.add('active');

    profileInfo.textContent = `Ник: ${user.displayName || 'Без ника'}, Email: ${user.email}`;
    avatarImg.src = user.photoURL || 'default-avatar.png';

    // Сохраняем пользователя в Firestore
    await db.collection('users').doc(user.uid).set({
      uid: user.uid,
      nickname: user.displayName || 'Без ника',
      email: user.email,
      lastSeen: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    loadUsersList();

    // Возвращаемся на вкладку Профиль
    setActiveTab(0);
  } else {
    splash.classList.add('active');
    loginScreen.classList.remove('active');
    main.classList.remove('active');

    profileInfo.textContent = 'Загрузка...';
    avatarImg.src = 'default-avatar.png';

    // Скрываем чат и список пользователей
    chatWindow.style.display = 'none';
    document.getElementById('chats').style.display = 'block';
  }
});
