let deleteModeActive = false; // 删除模式状态

// 页面加载时从Firebase获取软件库列表
onValue(ref(database, 'sites'), (snapshot) => {
    siteList.innerHTML = ''; // 清空列表
    snapshot.forEach((childSnapshot) => {
        const site = childSnapshot.val();
        const siteId = childSnapshot.key;

        const li = document.createElement('li');
        li.innerHTML = `
            <input type="text" class="site-name" value="${site.name}" disabled />
            <input type="text" class="site-url" value="${site.url}" disabled />
            <button class="edit-btn">修改</button>
            <button class="save-btn" disabled>保存</button>
            <input type="checkbox" class="delete-checkbox" data-id="${siteId}" style="display: none;" />
        `;

        siteList.appendChild(li);

        // 绑定编辑和保存按钮功能
        const editBtn = li.querySelector('.edit-btn');
        const saveBtn = li.querySelector('.save-btn');
        const siteNameInput = li.querySelector('.site-name');
        const siteUrlInput = li.querySelector('.site-url');

        editBtn.addEventListener('click', () => {
            siteNameInput.disabled = false;
            siteUrlInput.disabled = false;
            saveBtn.disabled = false;
        });

        saveBtn.addEventListener('click', () => {
            const newSiteName = siteNameInput.value.trim();
            const newSiteURL = siteUrlInput.value.trim();

            if (newSiteName && newSiteURL) {
                const siteRef = ref(database, 'sites/' + siteId);
                set(siteRef, {
                    name: newSiteName,
                    url: newSiteURL
                }).then(() => {
                    siteNameInput.disabled = true;
                    siteUrlInput.disabled = true;
                    saveBtn.disabled = true;
                }).catch((error) => {
                    console.error('保存数据时出错:', error);
                });
            } else {
                alert('请填写完整的网站名称和链接');
            }
        });
    });
});

// 删除模式：点击“删除软件库”按钮进入删除模式
deleteBtn.addEventListener('click', () => {
    if (deleteModeActive) {
        const checkedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
        if (checkedCheckboxes.length > 0) {
            // 删除选中的软件库
            checkedCheckboxes.forEach(checkbox => {
                const siteId = checkbox.getAttribute('data-id');
                remove(ref(database, 'sites/' + siteId))
                    .then(() => {
                        console.log('网站已删除');
                    })
                    .catch((error) => {
                        console.error('删除网站时出错：', error);
                    });
            });
            resetDeleteMode(); // 重置删除模式
        } else {
            // 没有选择，重置删除模式
            resetDeleteMode();
        }
    } else {
        activateDeleteMode(); // 进入删除模式
    }
});

function resetDeleteMode() {
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    deleteCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.style.display = 'none';
    });
    deleteBtn.textContent = '删除软件库';
    deleteModeActive = false;
}

function activateDeleteMode() {
    const deleteCheckboxes = document.querySelectorAll('.delete-checkbox');
    deleteCheckboxes.forEach(checkbox => {
        checkbox.style.display = 'inline-block'; // 显示复选框
    });
    deleteBtn.textContent = '确认删除库';
    deleteModeActive = true;
}
