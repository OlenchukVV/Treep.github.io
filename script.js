// Элементы
const loginScreen = document.getElementById('login');
const splash = document.getElementById('splash');
const main = document.getElementById('main');

const loginForm = document.getElementById('login-form');
const nicknameInput = document.getElementById('nickname');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const errorMsg = document.getElementById('error-msg');
const profileInfo = document.getElementById('profile-info');
const logoutBtn = document.getElementById('logout-btn');

const logo = splash.querySelector('.logo');
const tabButtons = document.querySelectorAll('#top-buttons .tab-btn');
const tabsWrapper = document.getElementById('tabs-wrapper');

// Вход
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      loginScreen.classList.remove('active');
      splash.classList.add('active');
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
    .then((userCredential) => {
      // Сохраним ник в профиле
      return userCredential.user.updateProfile({
        displayName: nickname
      });
    })
    .then(() => {
      errorMsg.textContent = 'Регистрация успешна! Теперь войдите.';
    })
    .catch(error => {
      errorMsg.textContent = error.message;
    });
});

// Выход
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    main.classList.remove('active');
    loginScreen.classList.add('active');
  });
});

// Переход splash -> меню
logo.addEventListener('click', () => {
  splash.classList.remove('active');
  main.classList.add('active');
  setActiveTab(0);
});

// Навигация по вкладкам
tabButtons.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    setActiveTab(idx);
  });
});

function setActiveTab(index) {
  tabsWrapper.style.transform = `translateX(-${index * (100 / 3)}%)`;
  tabButtons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}

// Проверка состояния авторизации
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.classList.remove('active');
    splash.classList.add('active');
    profileInfo.textContent = `Ник: ${user.displayName || 'Без ника'}, Email: ${user.email}`;
  } else {
    loginScreen.classList.add('active');
    splash.classList.remove('active');
    main.classList.remove('active');
    profileInfo.textContent = 'Загрузка...';
  }
});
