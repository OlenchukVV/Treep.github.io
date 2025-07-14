const splash = document.getElementById('splash');
const menu = document.getElementById('menu');
const logo = splash.querySelector('.logo');

logo.addEventListener('click', () => {
  splash.classList.remove('active');
  menu.classList.add('active');
});
