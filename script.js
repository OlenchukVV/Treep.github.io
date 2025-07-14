const splash = document.getElementById('splash');
const menu = document.getElementById('menu');
const logo = splash.querySelector('.logo');
const menuScroll = document.getElementById('menu-scroll');
const navButtons = document.querySelectorAll('.nav-btn');

// Переход со сплеша в меню
logo.addEventListener('click', () => {
  splash.classList.remove('active');
  menu.classList.add('active');
});

// Обновляем активную точку навигации при скролле
menuScroll.addEventListener('scroll', () => {
  const scrollLeft = menuScroll.scrollLeft;
  const width = menuScroll.clientWidth;
  const index = Math.round(scrollLeft / width);
  updateNav(index);
});

function updateNav(activeIndex) {
  navButtons.forEach((btn, i) => {
    if (i === activeIndex) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Навигация по клику на точки
navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const index = Number(btn.dataset.index);
    menuScroll.scrollTo({
      left: menuScroll.clientWidth * index,
      behavior: 'smooth',
    });
    updateNav(index);
  });
});
