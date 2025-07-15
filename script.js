// Firebase config и инициализация auth — предположим, что это есть в firebase.js
// const auth = firebase.auth();

// DOM элементы
const splash = document.getElementById('splash');
const loginScreen = document.getElementById('login');
const main = document.getElementById('main');

const splashLogo = document.getElementById('splash-logo');

const loginForm = document.getElementById('login-form');
const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-msg');

const profileAvatar = document.getElementById('profile-avatar');
const nickSpan = document.querySelector('#profile-nickname span');
const emailSpan = document.querySelector('#profile-email span');
const newNicknameInput = document.getElementById('new-nickname');
const changeNicknameBtn = document.getElementById('change-nickname-btn');
const profileMessage = document.getElementById('profile-message');
const logoutBtn = document.getElementById('logout-btn');

const tabButtons = document.querySelectorAll('#top-buttons .tab-btn');
const tabs = document.querySelectorAll('.tab');

// Splash -> login
splashLogo.addEventListener('click', () => {
  splash.classList.remove('active');
  loginScreen.classList.add('active');
  errorMsg.textContent = '';
  errorMsg.style.color = '#f88';
});

// Login submit
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();

  errorMsg.textContent = '';
  errorMsg.style.color = '#f88';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginForm.reset();
      // экран переключится в onAuthStateChanged
    })
    .catch(error => {
      errorMsg.textContent = error.message;
    });
});

// Register button
document.getElementById('register-btn').addEventListener('click', () => {
  errorMsg.textContent = '';
  errorMsg.style.color = '#f88';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const nickname = nicknameInput.value.trim();

  if (!email || !password || !nickname) {
    errorMsg.textContent = 'Заполните все поля!';
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
  .then(userCredential => {
    return userCredential.user.updateProfile({ displayName: nickname }).then(() => {
      // Сохраним данные пользователя в коллекции "users"
      return firebase.firestore().collection("users").doc(userCredential.user.uid).set({
        nickname,
        email
      });
    });
  })
  .then(() => {
    errorMsg.style.color = '#8f8';
    errorMsg.textContent = 'Регистрация успешна! Теперь войдите.';
    loginForm.reset();
  })
  .catch(error => {
    errorMsg.textContent = error.message;
  });
});

// Logout
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    main.classList.remove('active');
    splash.classList.add('active');
  });
});

// Change nickname
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
        nickSpan.textContent = newNick;
        newNicknameInput.value = '';
      })
      .catch(error => {
        profileMessage.textContent = 'Ошибка: ' + error.message;
      });
  }
});

// Tabs navigation — показываем только активный таб
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-index');

    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    tabs.forEach(tab => {
      if (tab.id === targetId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
  });
});

// Auth state observer
auth.onAuthStateChanged(user => {
  if (user) {
    splash.classList.remove('active');
    loginScreen.classList.remove('active');
    main.classList.add('active');

    nickSpan.textContent = user.displayName || 'Без ника';
    emailSpan.textContent = user.email;

    if (user.photoURL) {
      profileAvatar.src = user.photoURL;
    } else {
      profileAvatar.src = 'default-avatar.png'; // Укажи путь к своему дефолтному аватару
    }
  } else {
    splash.classList.add('active');
    loginScreen.classList.remove('active');
    main.classList.remove('active');

    nickSpan.textContent = 'Загрузка...';
    emailSpan.textContent = 'Загрузка...';
    profileAvatar.src = 'default-avatar.png';
  }
});
const userList = document.getElementById("user-list");
const chatWindow = document.getElementById("chat-window");
const chatMessages = document.getElementById("chat-messages");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatHeader = document.getElementById("chat-header");

let currentUser = null;
let currentChatUser = null;
let unsubscribeMessages = null;

auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadUsers();
  }
});

function loadUsers() {
  firebase.firestore().collection("users").onSnapshot(snapshot => {
    userList.innerHTML = "";
    snapshot.forEach(doc => {
      const userData = doc.data();
      if (doc.id !== currentUser.uid) {
        const div = document.createElement("div");
        div.textContent = userData.nickname || userData.email;
        div.classList.add("chat-user");
        div.addEventListener("click", () => openChat(doc.id, userData.nickname || userData.email));
        userList.appendChild(div);
      }
    });
  });
}

function getChatId(user1, user2) {
  return [user1, user2].sort().join("_");
}

function openChat(uid, name) {
  currentChatUser = uid;
  chatHeader.textContent = `Чат с ${name}`;
  chatWindow.classList.remove("hidden");

  const chatId = getChatId(currentUser.uid, uid);
  const messagesRef = firebase.firestore()
    .collection("chats").doc(chatId).collection("messages").orderBy("timestamp");

  if (unsubscribeMessages) unsubscribeMessages();

  unsubscribeMessages = messagesRef.onSnapshot(snapshot => {
    chatMessages.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      div.textContent = (msg.sender === currentUser.uid ? "Вы: " : "Он: ") + msg.text;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text || !currentChatUser) return;

  const chatId = getChatId(currentUser.uid, currentChatUser);
  const message = {
    text,
    sender: currentUser.uid,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  };

  firebase.firestore()
    .collection("chats")
    .doc(chatId)
    .collection("messages")
    .add(message);

  chatInput.value = "";
});

