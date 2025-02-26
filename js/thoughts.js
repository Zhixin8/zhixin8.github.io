// API地址配置
const API_URL = 'http://localhost:3000';

// 获取DOM元素
const thoughtsContainer = document.querySelector('.thoughts-container');
const loginSection = document.getElementById('loginSection');
const postSection = document.getElementById('postSection');
const thoughtContent = document.getElementById('thoughtContent');
const postThoughtButton = document.getElementById('postThoughtButton');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    loadThoughts();
    checkLoginStatus();
    setupEventListeners();
});

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        loginSection.style.display = 'none';
        postSection.style.display = 'block';
    } else {
        loginSection.style.display = 'block';
        postSection.style.display = 'none';
    }
}

// 加载说说列表
async function loadThoughts() {
    try {
        const response = await fetch(`${API_URL}/api/thoughts`);
        if (!response.ok) {
            throw new Error(`获取说说失败: ${response.status}`);
        }
        const thoughts = await response.json();
        if (!Array.isArray(thoughts)) {
            throw new Error('返回数据格式错误');
        }
        displayThoughts(thoughts);
    } catch (error) {
        console.error('加载说说失败:', error);
        thoughtsContainer.innerHTML = `<div class="empty-message">加载说说失败: ${error.message}</div>`;
    }
}

// 显示说说列表
function displayThoughts(thoughts) {
    if (!thoughts || thoughts.length === 0) {
        thoughtsContainer.innerHTML = '<div class="empty-message">还没有任何说说</div>';
        return;
    }

    // 按时间倒序排序
    thoughts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const thoughtsHTML = thoughts.map(thought => `
        <div class="thought-item">
            <div class="thought-content">${thought.content}</div>
            <div class="thought-footer">
                <div class="thought-time">${formatDate(thought.createdAt)}</div>
                ${thought.tags && thought.tags.length > 0 ? `
                    <div class="thought-tags">
                        ${thought.tags.map(tag => `<span class="thought-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    thoughtsContainer.innerHTML = thoughtsHTML;
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 登录按钮点击事件
    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                checkLoginStatus();
            } else {
                alert('登录失败，请检查用户名和密码');
            }
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败，请稍后重试');
        }
    });

    // 发布说说按钮点击事件
    postThoughtButton.addEventListener('click', async () => {
        const content = thoughtContent.value.trim();
        if (!content) {
            alert('请输入说说内容');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/thoughts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    content,
                    tags: []
                })
            });

            if (response.ok) {
                thoughtContent.value = '';
                loadThoughts(); // 重新加载说说列表
            } else {
                throw new Error('发布失败');
            }
        } catch (error) {
            console.error('发布说说失败:', error);
            alert('发布失败，请稍后重试');
        }
    });
}