// Firebase配置
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDk5p6EJAe02LEeqhQm1Z1dZxlIqGrRcUo",
    authDomain: "asqrt-ed615.firebaseapp.com",
    databaseURL: "https://asqrt-ed615-default-rtdb.firebaseio.com",
    projectId: "asqrt-ed615",
    storageBucket: "asqrt-ed615.appspot.com",
    messagingSenderId: "131720495048",
    appId: "1:131720495048:web:35f43929e31c1cc3428afd",
    measurementId: "G-G7D5HRMF0E"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// 获取DOM元素
const openModalBtn = document.getElementById('openModalBtn');
const modal = document.getElementById('modal');
const closeModalBtn = document.querySelector('.close');
const inputData = document.getElementById('inputData');
const submitBtn = document.getElementById('submitBtn');
const siteList = document.getElementById('siteList');

// 打开弹窗
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// 关闭弹窗
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 提交数据
submitBtn.addEventListener('click', () => {
    const lines = inputData.value.split('\n');
    lines.forEach(line => {
        const [name, url] = line.split('|').map(item => item.trim());
        if (name && url) {
            const newSiteRef = ref(database, 'sites/' + Date.now());
            set(newSiteRef, { name, url });
        }
    });
    alert('软件库已添加！');
    inputData.value = '';
    modal.style.display = 'none'; // 关闭弹窗
});

// 从Firebase获取网站列表
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const li = document.createElement('li');
        li.innerHTML = `<a href="${site.url}" target="_blank">${site.name}</a>`;
        siteList.appendChild(li);
    });
});

// 点击外部关闭弹窗
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};
