// 允许修改的网站和链接
function attachEditEvent() {
    const editBtns = document.querySelectorAll('.edit-btn');
    editBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('li');
            const siteNameElem = row.querySelector('.site-name');
            const siteURLElem = row.querySelector('.site-url');
            const saveBtn = row.querySelector('.save-btn');
            
            siteNameElem.removeAttribute('readonly'); // 允许修改名称
            siteURLElem.removeAttribute('readonly'); // 允许修改链接
            saveBtn.disabled = false; // 启用保存按钮
        });
    });
}

// 保存修改的网站和链接
function attachSaveEvent() {
    const saveBtns = document.querySelectorAll('.save-btn');
    saveBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const row = btn.closest('li');
            const siteId = btn.getAttribute('data-id');
            const newSiteName = row.querySelector('.site-name').value.trim();
            const newSiteURL = row.querySelector('.site-url').value.trim();

            if (newSiteName && newSiteURL) {
                // 更新数据库
                set(ref(database, 'sites/' + siteId), { name: newSiteName, url: newSiteURL })
                    .then(() => {
                        console.log('网站已更新');
                    })
                    .catch((error) => {
                        console.error('更新网站时出错：', error);
                    });
            } else {
                alert('名称或链接不能为空。');
            }
        });
    });
}

// 删除功能优化：处理未选择情况下的逻辑
deleteBtn.addEventListener('click', () => {
    if (deleteModeActive) {
        const checkedCheckboxes = document.querySelectorAll('.delete-checkbox:checked');
        if (checkedCheckboxes.length > 0) {
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
        } else {
            // 没有选择任何复选框，回到默认状态
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
