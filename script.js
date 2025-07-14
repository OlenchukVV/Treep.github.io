const splash = document.getElementById('splash');
const main = document.getElementById('main');
const logo = splash.querySelector('.logo');

const tabButtons = document.querySelectorAll('#top-buttons .tab-btn');
const tabsWrapper = document.getElementById('tabs-wrapper');

logo.addEventListener('click', () => {
  splash.classList.remove('active');
  main.classList.add('active');
  setActiveTab(0); // Профиль по умолчанию
});

tabButtons.forEach((btn, idx) => {
  btn.addEventListener('click', () => {
    setActiveTab(idx);
  });
});

function setActiveTab(index) {
  // Смещаем контейнер вкладок
  tabsWrapper.style.transform = `translateX(-${index * (100/3)}%)`;

  // Обновляем активные кнопки
  tabButtons.forEach((btn, i) => {
    btn.classList.toggle('active', i === index);
  });
}
