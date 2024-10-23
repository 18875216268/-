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

// 打开弹窗
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
});

// 关闭弹窗
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// 提交数据
tijiao.addEventListener('click', async () => {
    const lines = inputData.value.split('\n'); // 按行分割输入内容
    for (const line of lines) {
        const [name, url] = line.split('|').map(item => item.trim()); // 分割名称和链接
        if (name && url) {
            const newSiteRef = ref(database, 'sites/' + Date.now());
            
            const latency = await checkURLLatency(url); // 检查URL延迟
            const data = { name, url, latency: latency || 'N/A' }; // 保存延迟或'N/A'
            
            await set(newSiteRef, data); // 写入Firebase数据库
        }
    }
    alert('软件库已添加！');
    inputData.value = '';
    modal.style.display = 'none'; // 关闭弹窗
});

// 在获取网站列表的代码中添加删除按钮
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = '<li><input type="checkbox" id="selectAllCheckbox" /><label for="selectAllCheckbox">全选</label></li>'; // 重置列表并添加全选复选框
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const siteId = childSnapshot.key;

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" class="delete-checkbox" data-id="${siteId}" />
            <input type="text" class="site-name" value="${site.name}" disabled />
            <input type="text" class="site-url" value="${site.url}" disabled />
            <span class="latency">${site.latency || 'N/A'} ms</span>
            <button class="edit-btn" data-id="${siteId}">修改</button>
            <button class="save-btn" data-id="${siteId}" style="display:none;" disabled>保存</button>
            <button class="delete-single-btn" data-id="${siteId}">删除</button> <!-- 单独删除按钮 -->
        `;
        siteList.appendChild(li);
    });
    attachEventListeners(); // 绑定事件
});

// 添加全选功能
document.getElementById('siteList').addEventListener('change', (event) => {
    if (event.target.id === 'selectAllCheckbox') {
        const checkboxes = document.querySelectorAll('.delete-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = event.target.checked; // 根据全选复选框的状态来勾选或取消勾选
        });
    }
});

// 单独删除按钮的事件
siteList.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-single-btn')) {
        const siteId = event.target.getAttribute('data-id');
        remove(ref(database, 'sites/' + siteId))
            .then(() => {
                console.log('网站已删除');
            })
            .catch((error) => {
                console.error('删除网站时出错：', error);
            });
    }
});

// 绑定所有按钮的事件
function attachEventListeners() {
    const editBtns = document.querySelectorAll('.edit-btn');
    const saveBtns = document.querySelectorAll('.save-btn');
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    const checkLatencyBtn = document.getElementById('checkLatencyBtn'); // 获取检测延迟按钮


    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const li = btn.parentElement;
            li.querySelector('.site-name').removeAttribute('disabled');
            li.querySelector('.site-url').removeAttribute('disabled');
            btn.style.display = 'none';
            const saveBtn = li.querySelector('.save-btn');
            saveBtn.style.display = 'inline-block';
            saveBtn.removeAttribute('disabled');
        });
    });

    saveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const li = btn.parentElement;
            const siteId = btn.getAttribute('data-id');
            const name = li.querySelector('.site-name').value;
            const url = li.querySelector('.site-url').value;

            if (name && url) {
                set(ref(database, 'sites/' + siteId), { name, url })
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

    // 检测软件库延迟
    checkLatencyBtn.addEventListener('click', async () => {
        const latencyElements = document.querySelectorAll('.latency'); // 获取所有延迟显示元素
        for (const element of latencyElements) {
            const url = element.previousElementSibling.value; // 获取对应的URL
            const latency = await checkURLLatency(url); // 检测延迟
            element.textContent = `${latency !== null ? latency + ' ms' : '-1'}`; // 更新显示延迟数值和单位
        }
    });
}

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

// 检查URL有效性并测量延迟
async function checkURLLatency(url) {
    const corsProxy = 'https://proxy.cors.sh/'; // 更新为新的CORS代理地址
    const apiKey = 'temp_1200b21d21d7f70a5e4d88b86a7517a5'; // 替换为你的API秘钥
    const startTime = performance.now();

    // 尝试使用CORS代理请求
    try {
        const response = await fetch(corsProxy + url, {
            method: 'HEAD',
            headers: {
                'x-cors-api-key': apiKey
            }
        });
        if (!response.ok) {
            throw new Error('无效链接');
        }
        const latency = Math.round(performance.now() - startTime);
        return latency;
    } catch (error) {
        console.error('使用代理检测URL时出错:', error);
    }

    // 如果使用代理失败，尝试直接请求
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        const latency = Math.round(performance.now() - startTime);
        if (response.ok) {
            return latency;
        } else {
            throw new Error('无效链接');
        }
    } catch (error) {
        console.error('直接检测URL时出错:', error);
        return null; // 返回null以指示无法访问
    }
}
