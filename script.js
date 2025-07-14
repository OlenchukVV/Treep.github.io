const loginScreen = document.getElementById('login');
const splash = document.getElementById('splash');
const main = document.getElementById('main');

const phoneInputSection = document.getElementById('phone-input-section');
const codeInputSection = document.getElementById('code-input-section');

const phoneNumberInput = document.getElementById('phone-number');
const sendCodeBtn = document.getElementById('send-code-btn');

const verificationCodeInput = document.getElementById('verification-code');
const verifyCodeBtn = document.getElementById('verify-code-btn');

const errorMsg = document.getElementById('error-msg');
const profileInfo = document.getElementById('profile-info');
const logoutBtn = document.getElementById('logout-btn');

const logo = splash.querySelector('.logo');
const tabButtons = document.querySelectorAll('#top-buttons .tab-btn');
const tabsWrapper = document.getElementById('tabs-wrapper');

let confirmationResult = null;

// Инициализация reCAPTCHA (invisible)
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  'size': 'invisible',
  'callback': (response) => {
    // reCAPTCHA прошёл, можно отправлять код
    sendCode();
  },
  'expired-callback': () => {
    errorMsg.textContent = 'reCAPTCHA истекла, попробуйте снова.';
  }
});
recaptchaVerifier.render();

// Функция отправки SMS-кода
function sendCode() {
  errorMsg.textContent = '';
  const phoneNumber = phoneNumberInput.value.trim();

  if (!phoneNumber) {
    errorMsg.textContent = 'Введите номер телефона';
    return;
  }

  auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      phoneInputSection.style.display = 'none';
      codeInputSection.style.display = 'flex';
      errorMsg.textContent = 'Код отправлен. Введите его ниже.';
    })
    .catch((error) => {
      errorMsg.textContent = error.message;
      // Можно сбросить reCAPTCHA для повторной попытки:
      window.recaptchaVerifier.render().then(widgetId => {
        grecaptcha.reset(widgetId);
      });
    });
}

// Обработчик кнопки отправки кода
sendCodeBtn.addEventListener('click', () => {
  // Запускаем reCAPTCHA, а в callback будет sendCode()
  window.recaptchaVerifier.verify();
});

// Проверка введённого кода
verifyCodeBtn.addEventListener('click', () => {
  errorMsg.textContent = '';
  const code = verificationCodeInput.value.trim();

  if (!code) {
    errorMsg.textContent = 'Введите код из SMS';
    return;
  }

  confirmationResult.confirm(code)
    .then((result) => {
      // Успешная авторизация
      loginScreen.classList.remove('active');
      splash.classList.add('active');

      const user = result.user;
      profileInfo.textContent = `Вошли как: ${user.phoneNumber}`;
    })
    .catch((error) => {
      errorMsg.textContent = 'Неверный код или ошибка: ' + error.message;
    });
});

// Выход
logoutBtn.addEventListener('click', () => {
  auth.signOut().then(() => {
    main.classList.remove('active');
    phoneInputSection.style.display = 'flex';
    codeInputSection.style.display = 'none';
    loginScreen.classList.add('active');
    errorMsg.textContent = '';
    phoneNumberInput.value = '';
    verificationCodeInput.value = '';
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

// Проверка состояния авторизации при загрузке
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.classList.remove('active');
    splash.classList.add('active');
    profileInfo.textContent = `Вошли как: ${user.phoneNumber || user.email}`;
  } else {
    loginScreen.classList.add('active');
    splash.classList.remove('active');
    main.classList.remove('active');
    profileInfo.textContent = 'Загрузка...';
    phoneInputSection.style.display = 'flex';
    codeInputSection.style.display = 'none';
  }
});
