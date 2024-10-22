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
const deleteBtn = document.getElementById('deleteBtn');
const submitBtn = document.getElementById('submitBtn');
const modal = document.getElementById('modal');
const closeModal = document.getElementsByClassName('close')[0];
const inputData = document.getElementById('inputData');
const siteList = document.getElementById('siteList');

// 打开弹窗
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// 关闭弹窗
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 添加网站到Firebase数据库
submitBtn.addEventListener('click', () => {
    const data = inputData.value.trim().split('\n').map(line => line.split('|').map(item => item.trim()));

    // 解析数据并写入Firebase
    data.forEach(([name, url]) => {
        if (name && url) {
            const newSiteRef = ref(database, 'sites/' + Date.now());
            set(newSiteRef, { name, url });
        }
    });

    inputData.value = ''; // 清空输入框
    modal.style.display = 'none'; // 关闭弹窗
});

// 从Firebase获取网站列表
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = ''; // 清空当前列表
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="site-name" contenteditable="false">${site.name}</span>
            <a href="${site.url}" target="_blank">${site.url}</a>
            <input type="checkbox" class="delete-checkbox" data-id="${childSnapshot.key}">
            <button class="edit-btn" data-id="${childSnapshot.key}">修改</button>
            <button class="save-btn" data-id="${childSnapshot.key}" style="display:none;">保存</button>
        `;
        siteList.appendChild(li);
    });

    attachEditSaveEvent();
});

// 绑定修改和保存按钮事件
function attachEditSaveEvent() {
    const editBtns = document.querySelectorAll('.edit-btn');
    const saveBtns = document.querySelectorAll('.save-btn');

    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const siteId = btn.getAttribute('data-id');
            const li = btn.parentElement;
            li.querySelector('.site-name').contentEditable = true; // 允许编辑
            li.querySelector('.save-btn').style.display = 'inline'; // 显示保存按钮
            btn.style.display = 'none'; // 隐藏修改按钮
        });
    });

    saveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const siteId = btn.getAttribute('data-id');
            const li = btn.parentElement;
            const siteName = li.querySelector('.site-name').innerText;
            const siteURL = li.querySelector('a').href;

            set(ref(database, 'sites/' + siteId), { name: siteName, url: siteURL }) // 更新Firebase
                .then(() => {
                    li.querySelector('.site-name').contentEditable = false; // 关闭编辑
                    btn.style.display = 'none'; // 隐藏保存按钮
                    li.querySelector('.edit-btn').style.display = 'inline'; // 显示修改按钮
                });
        });
    });
}

// 删除软件库按钮事件
deleteBtn.addEventListener('click', () => {
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    deleteCheckboxes.forEach(checkbox => {
        checkbox.style.display = 'block'; // 显示复选框
    });

    deleteBtn.textContent = '确认删除库'; // 更改按钮文本
    deleteBtn.onclick = confirmDelete; // 修改按钮事件
});

// 确认删除库
function confirmDelete() {
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
    if (deleteCheckboxes.length === 0) {
        alert('请先选择要删除的软件库。');
        return; // 如果没有选择，返回
    }

    deleteCheckboxes.forEach(checkbox => {
        const siteId = checkbox.getAttribute('data-id');
        remove(ref(database, 'sites/' + siteId)); // 从Firebase删除
    });

    // 清除复选框和按钮状态
    const deleteCheckboxesAll = document.querySelectorAll('.delete-checkbox');
    deleteCheckboxesAll.forEach(checkbox => {
        checkbox.style.display = 'none'; // 隐藏复选框
        checkbox.checked = false; // 清空复选框选中状态
    });
    deleteBtn.textContent = '删除软件库'; // 恢复按钮文本
}

// 关闭模态框时隐藏复选框
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
        const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
        deleteCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'none'; // 隐藏复选框
            checkbox.checked = false; // 清空复选框选中状态
        });
        deleteBtn.textContent = '删除软件库'; // 恢复按钮文本
    }
});
