// 获取文件输入和上传按钮
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');

// 批量添加网站功能
uploadBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            const lines = content.split('\n');
            lines.forEach(line => {
                const [name, url] = line.split('|').map(item => item.trim());
                if (name && url) {
                    const newSiteRef = ref(database, 'sites/' + Date.now());
                    set(newSiteRef, { name, url });
                }
            });
            alert('网站已批量添加！');
        };
        reader.readAsText(file);
    } else {
        alert('请上传一个文件。');
    }
});
