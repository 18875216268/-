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
    const lines = inputData.value.split('\n'); // 按行分割输入内容
    lines.forEach(line => {
        const [name, url] = line.split('|').map(item => item.trim()); // 分割名称和链接
        if (name && url) {
            const newSiteRef = ref(database, 'sites/' + Date.now());
            set(newSiteRef, { name, url }); // 写入Firebase数据库
        }
    });
    alert('软件库已添加！'); // 提示用户
    inputData.value = ''; // 清空输入框
    modal.style.display = 'none'; // 关闭弹窗
});

// 从Firebase获取网站列表
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = ''; // 清空当前列表
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const siteId = childSnapshot.key; // 获取网站的ID
        const li = document.createElement('li');
        li.innerHTML = `
            <span><a href="${site.url}" target="_blank">${site.name}</a></span>
            <button class="delete-btn" data-id="${siteId}">删除</button>
        `; // 添加网站链接和删除按钮
        siteList.appendChild(li); // 将列表项添加到页面
    });
    attachDeleteEvent(); // 绑定删除按钮事件
});

// 绑定删除按钮事件
function attachDeleteEvent() {
    const deleteBtns = document.querySelectorAll('.delete-btn');
    deleteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const siteId = btn.getAttribute('data-id'); // 获取对应网站的ID
            remove(ref(database, 'sites/' + siteId)) // 从Firebase数据库删除
                .then(() => {
                    console.log('网站已删除');
                })
                .catch((error) => {
                    console.error('删除网站时出错：', error);
                });
        });
    });
}

// 点击外部关闭弹窗
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // 点击外部关闭弹窗
    }
};
