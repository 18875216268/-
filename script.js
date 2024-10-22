// Firebase配置
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getDatabase, ref, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-database.js";

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
const addBtn = document.getElementById('addBtn');
const siteNameInput = document.getElementById('siteName');
const siteURLInput = document.getElementById('siteURL');
const siteList = document.getElementById('siteList');

// 添加网站到Firebase数据库
addBtn.addEventListener('click', () => {
    const siteName = siteNameInput.value.trim();
    const siteURL = siteURLInput.value.trim();

    if (siteName && siteURL) {
        const newSiteRef = ref(database, 'sites/' + Date.now());
        set(newSiteRef, { name: siteName, url: siteURL });

        siteNameInput.value = '';
        siteURLInput.value = '';
    } else {
        alert('请填写完整的网站名称和链接。');
    }
});

// 从Firebase获取网站列表
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const li = document.createElement('li');
        li.innerHTML = `<a href="${site.url}" target="_blank">${site.name}</a>
                       <button class="delete-btn" data-id="${childSnapshot.key}">删除</button>`;
        siteList.appendChild(li);
    });
    attachDeleteEvent();
});

// 绑定删除按钮事件
function attachDeleteEvent() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const siteId = btn.getAttribute('data-id');
            remove(ref(database, 'sites/' + siteId))
                .then(() => {
                    console.log('网站已删除');
                })
                .catch((error) => {
                    console.error('删除网站时出错：', error);
                });
        });
    });
}
