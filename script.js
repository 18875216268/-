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
const deleteBtn = document.getElementById('deleteBtn');

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

        // 创建输入框用于显示名称和链接
        li.innerHTML = `
            <input type="text" class="site-name" value="${site.name}" disabled />
            <input type="text" class="site-url" value="${site.url}" disabled />
            <button class="edit-btn" data-id="${siteId}">修改</button>
            <button class="save-btn" data-id="${siteId}" style="display:none;" disabled>保存</button>
            <button class="delete-btn" data-id="${siteId}" style="display:none;">删除</button>
            <input type="checkbox" class="delete-checkbox" data-id="${siteId}" style="display:none;" />
        `; // 添加网站名称、链接和操作按钮
        siteList.appendChild(li); // 将列表项添加到页面
    });
    attachEventListeners(); // 绑定事件
});

// 绑定所有按钮的事件
function attachEventListeners() {
    const editBtns = document.querySelectorAll('.edit-btn');
    const saveBtns = document.querySelectorAll('.save-btn');
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');

    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const li = btn.parentElement; // 获取当前列表项
            const siteId = btn.getAttribute('data-id'); // 获取对应网站的ID
            li.querySelector('.site-name').removeAttribute('disabled'); // 启用编辑
            li.querySelector('.site-url').removeAttribute('disabled'); // 启用编辑
            btn.style.display = 'none'; // 隐藏修改按钮
            li.querySelector('.save-btn').style.display = 'inline-block'; // 显示保存按钮
            li.querySelector('.save-btn').removeAttribute('disabled'); // 启用保存按钮
        });
    });

    saveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const li = btn.parentElement; // 获取当前列表项
            const siteId = btn.getAttribute('data-id'); // 获取对应网站的ID
            const name = li.querySelector('.site-name').value; // 获取编辑后的名称
            const url = li.querySelector('.site-url').value; // 获取编辑后的链接

            if (name && url) {
                set(ref(database, 'sites/' + siteId), { name, url }) // 更新Firebase数据库
                    .then(() => {
                        alert('网站信息已更新！'); // 提示用户
                        btn.style.display = 'none'; // 隐藏保存按钮
                        li.querySelector('.edit-btn').style.display = 'inline-block'; // 显示修改按钮
                        li.querySelector('.site-name').setAttribute('disabled', 'true'); // 禁用编辑
                        li.querySelector('.site-url').setAttribute('disabled', 'true'); // 禁用编辑
                    })
                    .catch((error) => {
                        console.error('更新网站信息时出错：', error);
                    });
            } else {
                alert('请填写完整的网站名称和链接。'); // 提示用户
            }
        });
    });
}

// 统一删除按钮事件
deleteBtn.addEventListener('click', () => {
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    const confirmDelete = document.getElementById('confirmDelete');
    
    if (deleteBtn.textContent === "删除软件库") {
        // 显示复选框以选择删除网站
        deleteCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'inline'; // 显示复选框
        });
        deleteBtns.forEach(btn => {
            btn.style.display = 'none'; // 隐藏单个删除按钮
        });
        deleteBtn.textContent = "确认删除库"; // 修改按钮文本
    } else {
        // 确认删除选中的网站
        const selectedIds = Array.from(deleteCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.getAttribute('data-id'));

        selectedIds.forEach(siteId => {
            remove(ref(database, 'sites/' + siteId)) // 从Firebase数据库删除
                .then(() => {
                    console.log('网站已删除');
                })
                .catch((error) => {
                    console.error('删除网站时出错：', error);
                });
        });

        deleteCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'none'; // 隐藏复选框
        });
        deleteBtns.forEach(btn => {
            btn.style.display = 'inline'; // 显示单个删除按钮
        });
        deleteBtn.textContent = "删除软件库"; // 恢复按钮文本
    }
});

// 点击外部关闭弹窗
window.onclick = (event) => {
    if (event.target === modal) {
        modal.style.display = 'none'; // 点击外部关闭弹窗
    }
};
