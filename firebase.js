// firebase.js — только конфигурация и инициализация Firebase

// Вставь сюда свой конфиг Firebase из консоли
const firebaseConfig = {
  apiKey: "AIzaSyDsAWbWNwOY_EECrjhycEdUoyyhrKbb1-A",
  authDomain: "treep---messenger.firebaseapp.com",
  projectId: "treep---messenger",
  storageBucket: "treep---messenger.firebasestorage.app",
  messagingSenderId: "210269473042",
  appId: "1:210269473042:web:0b0d004d3c6a364f878bcb",
  measurementId: "G-F7T64XE65K"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
