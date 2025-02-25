document.addEventListener('DOMContentLoaded', function() {
    const editor = {
        init() {
            this.articleTitle = document.getElementById('articleTitle');
            this.articleContent = document.getElementById('articleContent');
            this.toolbarButtons = document.querySelectorAll('.toolbar-button');
            this.fileUpload = document.getElementById('fileUpload');
            this.uploadProgress = document.querySelector('.upload-progress');
            this.progressBar = document.querySelector('.progress-bar-fill');
            this.saveDraftBtn = document.getElementById('saveDraft');
            this.publishBtn = document.getElementById('publishArticle');

            // 初始化编辑器状态
            this.articleContent.focus();
            this.articleContent.addEventListener('focus', () => {
                // 确保编辑区域始终可编辑
                this.articleContent.contentEditable = 'true';
            });

            this.bindEvents();
        },

        bindEvents() {
            // 工具栏按钮事件
            this.toolbarButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault(); // 阻止默认行为
                    this.handleToolbarAction(button);
                });
            });

            // 文件上传事件
            this.fileUpload.addEventListener('change', (e) => this.handleFileUpload(e));

            // 保存草稿事件
            this.saveDraftBtn.addEventListener('click', () => this.saveDraft());

            // 发布文章事件
            this.publishBtn.addEventListener('click', () => this.publishArticle());

            // 处理粘贴事件
            this.articleContent.addEventListener('paste', (e) => this.handlePaste(e));
        },

        handleToolbarAction(button) {
            const command = button.getAttribute('data-command');
            
            // 确保编辑区域获得焦点
            this.articleContent.focus();
            
            switch(command) {
                case 'insertImage':
                    this.fileUpload.accept = 'image/*';
                    this.fileUpload.click();
                    break;
                case 'attachment':
                    this.fileUpload.accept = '*/*';
                    this.fileUpload.click();
                    break;
                case 'createLink':
                    const url = prompt('请输入链接地址：');
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                    break;
                case 'h2':
                    document.execCommand('formatBlock', false, '<h2>');
                    break;
                case 'h3':
                    document.execCommand('formatBlock', false, '<h3>');
                    break;
                default:
                    document.execCommand(command, false, null);
            }
        },

        async handleFileUpload(event) {
            const files = event.target.files;
            if (!files.length) return;

            this.uploadProgress.style.display = 'block';
            
            for (let file of files) {
                try {
                    const formData = new FormData();
                    formData.append('file', file);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        body: formData,
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            this.progressBar.style.width = `${percentCompleted}%`;
                        }
                    });

                    if (!response.ok) throw new Error('上传失败');

                    const data = await response.json();
                    
                    if (file.type.startsWith('image/')) {
                        // 插入图片
                        const img = `<img src="${data.url}" alt="${file.name}" style="max-width:100%">`;
                        this.insertHtmlAtCursor(img);
                    } else {
                        // 插入附件链接
                        const link = `<a href="${data.url}" target="_blank" class="attachment">${file.name}</a>`;
                        this.insertHtmlAtCursor(link);
                    }
                } catch (error) {
                    console.error('文件上传失败:', error);
                    alert('文件上传失败，请重试');
                }
            }

            setTimeout(() => {
                this.uploadProgress.style.display = 'none';
                this.progressBar.style.width = '0';
                this.fileUpload.value = '';
            }, 1000);
        },

        handlePaste(e) {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            
            for (let item of items) {
                if (item.type.indexOf('image') === 0) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (file) {
                        const dT = new DataTransfer();
                        dT.items.add(file);
                        this.fileUpload.files = dT.files;
                        this.handleFileUpload({ target: { files: this.fileUpload.files } });
                    }
                    break;
                }
            }
        },

        insertHtmlAtCursor(html) {
            const selection = window.getSelection();
            if (selection.getRangeAt && selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                const div = document.createElement('div');
                div.innerHTML = html;
                const fragment = document.createDocumentFragment();
                let node;
                while ((node = div.firstChild)) {
                    fragment.appendChild(node);
                }
                range.insertNode(fragment);

                // 移动光标到插入内容的末尾
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        },

        async saveDraft() {
            if (!this.articleTitle.value.trim()) {
                alert('请输入文章标题');
                return;
            }

            const draft = {
                title: this.articleTitle.value,
                content: this.articleContent.innerHTML,
                status: 'draft',
                date: new Date().toISOString()
            };

            try {
                const response = await fetch('/api/articles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(draft)
                });

                if (!response.ok) throw new Error('保存失败');

                alert('草稿保存成功！');
            } catch (error) {
                console.error('保存草稿失败:', error);
                alert('保存失败，请重试');
            }
        },

        async publishArticle() {
            if (!this.articleTitle.value.trim()) {
                alert('请输入文章标题');
                return;
            }

            if (!this.articleContent.textContent.trim()) {
                alert('请输入文章内容');
                return;
            }

            const title = this.articleTitle.value;
            const content = this.articleContent.innerHTML;
            const date = new Date();
            const id = this.generateArticleId(title);
            const readingTime = this.calculateReadingTime(this.articleContent.textContent);

            const article = {
                id,
                title,
                content,
                date: date.toISOString(),
                status: 'published',
                readingTime: `${readingTime}分钟`,
                excerpt: this.generateExcerpt(this.articleContent.textContent)
            };

            try {
                // 创建文章HTML文件
                const htmlContent = this.generateArticleHtml(article);
                const response = await fetch('/api/create-article', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id,
                        content: htmlContent
                    })
                });

                if (!response.ok) throw new Error('创建文章文件失败');

                // 保存文章数据
                const saveResponse = await fetch('/api/articles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(article)
                });

                if (!response.ok) throw new Error('发布失败');

                alert('文章发布成功！');
                window.location.href = 'articles.html';
            } catch (error) {
                console.error('发布文章失败:', error);
                alert('发布失败，请重试');
            }
        }
    };

    editor.init();

    // 生成文章ID
    editor.generateArticleId = function(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '-') // 空格替换为连字符
            .replace(/-+/g, '-'); // 多个连字符替换为单个
    };

    // 计算阅读时间
    editor.calculateReadingTime = function(text) {
        const wordsPerMinute = 300; // 假设平均阅读速度为每分钟300字
        const wordCount = text.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    };

    // 生成文章摘要
    editor.generateExcerpt = function(text) {
        const plainText = text.replace(/<[^>]+>/g, '').trim();
        return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
    };

    // 生成文章HTML
    editor.generateArticleHtml = function(article) {
        const formattedDate = new Date(article.date).toLocaleDateString('zh-CN');
        return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} | Jockiery的知识花园</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/article.css">
    <script src="../js/main.js" defer></script>
</head>
<body>
    <nav class="nav">
        <div class="nav-container">
            <a href="../index.html" class="logo">Jockiery</a>
            <div class="nav-links">
                <a href="../index.html">主页</a>
                <a href="../articles.html">文章</a>
                <a href="../photos.html">摄影</a>
                <a href="../thoughts.html">说说</a>
                <a href="../garden.html">花园</a>
                <a href="../about.html">关于</a>
            </div>
        </div>
    </nav>

    <main class="main-content">
        <article class="article">
            <header class="article-header">
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">${formattedDate} · 阅读时间：${article.readingTime}</div>
            </header>
            <div class="article-content">
                ${article.content}
            </div>
        </article>
    </main>

    <footer class="footer">
        <p>&copy; 2024 Jockiery的知识花园. All rights reserved.</p>
    </footer>
</body>
</html>`;
    };
});