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

const profileInfo = document.getElementById('profile-info');
const newNicknameInput = document.getElementById('new-nickname');
const changeNicknameBtn = document.getElementById('change-nickname-btn');
const profileMessage = document.getElementById('profile-message');
const logoutBtn = document.getElementById('logout-btn');

const tabButtons = document.querySelectorAll('#top-buttons .tab-btn');
const tabsWrapper = document.getElementById('tabs-wrapper');

const avatarUploadInput = document.getElementById('avatar-upload');
const avatarMessage = document.getElementById('avatar-message');
const profileAvatar = document.getElementById('profile-avatar');

// Логика: splash -> login
splashLogo.addEventListener('click', () => {
  splash.classList.remove('active');
  loginScreen.classList.add('active');
  errorMsg.textContent = '';
  errorMsg.style.color = '#f88';
});

// Вход (submit формы)
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

// Регистрация по кнопке
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
      return userCredential.user.updateProfile({ displayName: nickname });
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

// Выход
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    main.classList.remove('active');
    splash.classList.add('active');
  });
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
  });
});

function setActiveTab(index) {
  // Показываем нужную вкладку, остальные скрываем
  document.querySelectorAll('.tab').forEach((tab, i) => {
    tab.style.display = (i === index) ? 'block' : 'none';
  });
  tabButtons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

// Слежение за авторизацией
auth.onAuthStateChanged(user => {
  if (user) {
    splash.classList.remove('active');
    loginScreen.classList.remove('active');
    main.classList.add('active');

    profileInfo.textContent = `Ник: ${user.displayName || 'Без ника'}, Email: ${user.email}`;
    profileAvatar.src = user.photoURL || 'default-avatar.png';

    setActiveTab(0); // Показываем профиль по умолчанию
  } else {
    splash.classList.add('active');
    loginScreen.classList.remove('active');
    main.classList.remove('active');

    profileInfo.textContent = 'Загрузка...';
  }
});

// Загрузка и смена аватара
avatarUploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  avatarMessage.textContent = 'Загрузка...';

  try {
    const user = auth.currentUser;
    if (!user) throw new Error('Пользователь не авторизован');

    const storageRef = firebase.storage().ref();
    const avatarRef = storageRef.child(`avatars/${user.uid}/${file.name}`);

    await avatarRef.put(file);
    const photoURL = await avatarRef.getDownloadURL();

    await user.updateProfile({ photoURL });

    profileAvatar.src = photoURL;
    avatarMessage.textContent = 'Аватар успешно обновлен!';
  } catch (err) {
    avatarMessage.textContent = 'Ошибка: ' + err.message;
  }
});
