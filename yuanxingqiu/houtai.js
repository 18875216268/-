// Firebase 数据库初始化
const firebaseConfig = {
    apiKey: "AIzaSyDgcIPCu9b3posqiT4TxF8VoZ8H7aeAbwo",
    authDomain: "yxingqiu-e3d0a.firebaseapp.com",
    databaseURL: "https://yxingqiu-e3d0a-default-rtdb.firebaseio.com",
    projectId: "yxingqiu-e3d0a",
    storageBucket: "yxingqiu-e3d0a.firebasestorage.app",
    messagingSenderId: "739990650463",
    appId: "1:739990650463:web:83fbac8e151a2d57b8e5ea",
    measurementId: "G-NF3XRKP880"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// 公共函数
function iterateSelectedRows(callback) {
    const tbody = document.getElementById('data-table-body');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const checkbox = row.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            callback(row);
        }
    });
}

function updateApprovalStatus(row, newStatus) {
    const button = row.querySelector('.btn-approve');
    const key = button.getAttribute('onclick').match(/'([^']+)'/)[1];
    database.ref('resources/' + key).update({ status: newStatus }).then(() => {
        button.innerText = newStatus === '已审核' ? '已通过' : '未通过';
        if (newStatus === '已审核') {
            button.classList.remove('unapproved');
        } else {
            button.classList.add('unapproved');
        }
    }).catch(error => {
        console.error('批量更新状态时出错:', error);
    });
}

// 切换选中记录的审核状态
function toggleSelectedApproval() {
    iterateSelectedRows(row => {
        const button = row.querySelector('.btn-approve');
        const currentStatus = button.innerText;
        const newStatus = currentStatus === '已通过' ? '未审核' : '已审核';
        updateApprovalStatus(row, newStatus);
    });
}

// 打开添加记录弹窗
function openAddModal() {
    document.getElementById('addModal').style.display = 'flex';
}

// 关闭添加记录弹窗
function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

// 打开搜索弹窗
function toggleSearchModal() {
    const searchIcon = document.getElementById('search-icon');
    if (searchIcon.getAttribute('src') === 'sousuo.png') {
        document.getElementById('searchModal').style.display = 'flex';
    } else {
        resetSearch();
    }
}

// 关闭搜索弹窗
function closeSearchModal() {
    document.getElementById('searchModal').style.display = 'none';
}

// 搜索记录
function searchRecords() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!searchTerm) {
        alert('请输入搜索关键字');
        return;
    }

    const tbody = document.getElementById('data-table-body');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        const date = row.querySelector('.editable-date').innerText.toLowerCase();
        const tag = row.querySelector('.editable-tag').innerText.toLowerCase();
        const title = row.querySelector('.editable-title').innerText.toLowerCase();
        const url = row.querySelector('.editable-url').innerText.toLowerCase();
        const status = row.querySelector('.btn-approve').innerText.toLowerCase();

        if (
            date.includes(searchTerm) ||
            tag.includes(searchTerm) ||
            title.includes(searchTerm) ||
            url.includes(searchTerm) ||
            status.includes(searchTerm)
        ) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });

    const searchIcon = document.getElementById('search-icon');
    searchIcon.setAttribute('src', 'quxiao.png');
    closeSearchModal();
}

// 重置搜索
function resetSearch() {
    const tbody = document.getElementById('data-table-body');
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
        row.style.display = '';
    });

    const searchIcon = document.getElementById('search-icon');
    searchIcon.setAttribute('src', 'sousuo.png');
}

// 添加记录
function addRecords() {
    const recordInput = document.getElementById('recordInput').value.trim();
    if (!recordInput) {
        alert('请输入记录内容');
        return;
    }

    const records = recordInput.split('\n');
    const newRecords = records.map(record => {
        const [tag, title, url] = record.split('|');
        if (tag && title && url) {
            return {
                tag: tag.trim(),
                title: title.trim(),
                url: url.trim(),
                date: new Date().toISOString().split('T')[0],
            };
        } else {
            return null;
        }
    }).filter(record => record !== null);

    newRecords.forEach(record => {
        const newRef = database.ref('resources').push();
        newRef.set(record).then(() => {
            renderTableRow(record, newRef.key);
        }).catch(error => {
            console.error('添加记录时出错:', error);
        });
    });

    closeAddModal();
    document.getElementById('recordInput').value = '';
}

function renderTableRow(data, key) {
    const tbody = document.getElementById('data-table-body');
    const index = tbody.children.length + 1;
    const status = data.status === '已审核' ? '已通过' : '未通过';
    tbody.appendChild(createTableRow(index, data, key, status));
}

// 删除选中记录
function deleteSelectedRecords() {
    iterateSelectedRows(row => {
        const key = row.querySelector('.btn-approve').getAttribute('onclick').match(/'([^']+)'/)[1];
        database.ref('resources/' + key).remove().then(() => {
            row.remove();
        }).catch(error => {
            console.error('删除选中记录时出错:', error);
        });
    });
}

// 勾选全选框时，选择所有显示的单选框
document.getElementById('selectAll').addEventListener('change', (event) => {
    const checkboxes = document.querySelectorAll('tbody tr'); // 获取所有行
    checkboxes.forEach(row => {
        if (row.style.display !== 'none') { // 只选择显示的行
            const checkbox = row.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.checked = event.target.checked;
            }
        }
    });
});

// 从Firebase读取数据并按日期降序排序后填充表格
database.ref('resources').orderByChild('date').once('value').then(snapshot => {
    if (snapshot.exists()) {
        const dataArray = [];
        snapshot.forEach(childSnapshot => {
            dataArray.push(childSnapshot);
        });
        dataArray.sort((a, b) => new Date(b.val().date) - new Date(a.val().date));
        renderTable(dataArray);
    }
}).catch(error => {
    console.error('读取数据时出错:', error);
});

function renderTable(dataArray) {
    const tbody = document.getElementById('data-table-body');
    tbody.innerHTML = '';
    let index = 1;
    dataArray.forEach(childSnapshot => {
        const data = childSnapshot.val();
        const status = data.status === '已审核' ? '已通过' : '未通过';
        tbody.appendChild(createTableRow(index++, data, childSnapshot.key, status));
    });
}

function createTableRow(index, data, key, status) {
    const tr = document.createElement('tr');
    const approveClass = status === '未通过' ? 'btn-approve unapproved' : 'btn-approve';
    tr.innerHTML = `
        <td>${index}</td>
        <td contenteditable="false" class="editable-date">${data.date}</td>
        <td contenteditable="false" class="editable-tag">${data.tag}</td>
        <td contenteditable="false" class="editable-title">${data.title}</td>
        <td contenteditable="false" class="editable-url">${data.url}</td>
        <td><button class="btn ${approveClass}" onclick="toggleApproval('${key}', this)">${status}</button></td>
        <td><button class="btn btn-edit" onclick="toggleEdit('${key}', this)">编辑</button></td>
        <td><button class="btn btn-delete" onclick="deleteRecord('${key}', this)">删除</button></td>
        <td><button class="btn btn-visit" onclick="visitUrl('${data.url}')">访问</button></td>
        <td><input type="checkbox" class="checkbox"></td>
    `;
    return tr;
}

// 切换审核状态
function toggleApproval(key, button) {
    const newStatus = button.innerText === '已通过' ? '未审核' : '已审核';
    database.ref('resources/' + key).update({ status: newStatus }).then(() => {
        button.innerText = newStatus === '已审核' ? '已通过' : '未通过';
        if (newStatus === '已审核') {
            button.classList.remove('unapproved');
        } else {
            button.classList.add('unapproved');
        }
    }).catch(error => {
        console.error('更新状态时出错:', error);
    });
}

// 切换编辑和保存状态
function toggleEdit(key, button) {
    const tr = button.closest('tr');
    const isEditing = button.innerText === '编辑';
    const cells = tr.querySelectorAll('.editable-date, .editable-tag, .editable-title, .editable-url');

    if (isEditing) {
        button.innerText = '保存';
        cells.forEach(cell => {
            cell.contentEditable = true;
            cell.style.backgroundColor = '#fff8dc';
        });
    } else {
        button.innerText = '编辑';
        const updatedData = {
            date: tr.querySelector('.editable-date').innerText,
            tag: tr.querySelector('.editable-tag').innerText,
            title: tr.querySelector('.editable-title').innerText,
            url: tr.querySelector('.editable-url').innerText.trim()
        };

        database.ref('resources/' + key).update(updatedData).then(() => {
            cells.forEach(cell => {
                cell.contentEditable = false;
                cell.style.backgroundColor = '';
            });

            const visitButton = tr.querySelector('.btn-visit');
            visitButton.setAttribute('onclick', `visitUrl('${updatedData.url}')`);

        }).catch(error => {
            console.error('保存编辑时出错:', error);
        });
    }
}

// 删除记录
function deleteRecord(key, button) {
    database.ref('resources/' + key).remove().then(() => {
        button.closest('tr').remove();
    }).catch(error => {
        console.error('删除记录时出错:', error);
    });
}

// 访问网址
function visitUrl(url) {
    url = url.trim();
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+.*)$/;
    if (!urlPattern.test(url)) {
        alert("提供的网址无效，请检查网址格式。");
        return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }
    window.open(url, '_blank');
}
