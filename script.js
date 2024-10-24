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
const tijiao = document.getElementById('tijiao');
const siteList = document.getElementById('siteList');
const deleteBtn = document.getElementById('deleteBtn');
const checkLatencyBtn = document.getElementById('checkLatencyBtn'); // 检测按钮

// 打开弹窗
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// 关闭弹窗
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 检测网站是否可访问
async function checkWebsiteStatus(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        if (response.ok) {
            return "正常";  // HTTP 200表示正常
        } else {
            return "异常";  // 其他状态码表示异常
        }
    } catch (error) {
        return "异常";  // 捕获到错误也认为是异常
    }
}

// 提交数据时，检测网站状态并保存到数据库
tijiao.addEventListener('click', async () => {
    const lines = inputData.value.split('\n'); // 按行分割输入内容
    for (const line of lines) {
        const [name, url] = line.split('|').map(item => item.trim()); // 分割名称和链接
        if (name && url) {
            const newSiteRef = ref(database, 'sites/' + Date.now());

            const status = await checkWebsiteStatus(url); // 检查URL可访问性
            const data = { name, url, status }; // 保存状态
            
            await set(newSiteRef, data); // 写入Firebase数据库
        }
    }
    alert('软件库已添加并检测完成！');
    inputData.value = '';
    modal.style.display = 'none'; // 关闭弹窗
});

// 从Firebase获取网站列表并显示状态
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = ''; // 清空当前列表
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const siteId = childSnapshot.key;

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="text" class="site-name" value="${site.name}" disabled />
            <input type="text" class="site-url" value="${site.url}" disabled />
            <span class="status">${site.status || '未知'}</span> <!-- 显示检测状态 -->
            <button class="edit-btn" data-id="${siteId}">修改</button>
            <button class="save-btn" data-id="${siteId}" style="display:none;" disabled>保存</button>
            <input type="checkbox" class="delete-checkbox" data-id="${siteId}" style="display:none; transform: scale(1.5);" />
        `;
        siteList.appendChild(li);
    });
    attachEventListeners(); // 绑定事件
});

// 绑定所有按钮的事件
function attachEventListeners() {
    const editBtns = document.querySelectorAll('.edit-btn');
    const saveBtns = document.querySelectorAll('.save-btn');
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');

    saveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const li = btn.parentElement;
            const siteId = btn.getAttribute('data-id');
            const name = li.querySelector('.site-name').value;
            const url = li.querySelector('.site-url').value;

            if (name && url) {
                set(ref(database, 'sites/' + siteId), { name, url, status: li.querySelector('.status').textContent })
                    .then(() => {
                        btn.style.display = 'none';
                        li.querySelector('.edit-btn').style.display = 'inline-block';
                        li.querySelector('.site-name').setAttribute('disabled', 'true');
                        li.querySelector('.site-url').setAttribute('disabled', 'true');
                    })
                    .catch((error) => {
                        console.error('更新网站信息时出错！', error);
                    });
            } else {
                alert('请填写完整的网站名称和链接。');
            }
        });
    });
}

// 检测所有网站的状态
checkLatencyBtn.addEventListener('click', async () => {
    const siteElements = document.querySelectorAll('.site-url'); // 获取所有网站URL
    for (const siteElement of siteElements) {
        const li = siteElement.parentElement;
        const siteId = li.querySelector('.save-btn').getAttribute('data-id');
        const url = siteElement.value;

        const status = await checkWebsiteStatus(url); // 检测网站是否正常访问
        li.querySelector('.status').textContent = status; // 更新显示状态

        // 更新数据库中的状态
        const name = li.querySelector('.site-name').value;
        await set(ref(database, 'sites/' + siteId), { name, url, status });
    }
});

// 统一删除按钮事件
deleteBtn.addEventListener('click', () => {
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');

    if (deleteBtn.textContent === "删除软件库") {
        deleteCheckboxes.forEach(checkbox => {
            checkbox.style.display = 'inline-block';
        });
        deleteBtn.textContent = "确认删除库";
    } else {
        const selectedIds = Array.from(deleteCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.getAttribute('data-id'));

        if (selectedIds.length > 0) {
            selectedIds.forEach(siteId => {
                remove(ref(database, 'sites/' + siteId))
                    .then(() => {
                        console.log('网站已删除');
                    })
                    .catch((error) => {
                        console.error('删除网站时出错：', error);
                    });
            });
        } 
        deleteCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.style.display = 'none';
        });
        deleteBtn.textContent = "删除软件库"; // 恢复删除按钮文本
    }
});

// 添加全选功能
document.getElementById('siteList').addEventListener('change', (event) => {
    if (event.target.id === 'selectAllCheckbox') {
        const checkboxes = document.querySelectorAll('.delete-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = event.target.checked;
        });
    }
});
