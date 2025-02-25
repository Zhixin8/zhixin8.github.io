// 登录模态框相关元素
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeBtn = document.querySelector('.close');
const loginForm = document.getElementById('loginForm');

// 显示登录模态框
loginBtn.addEventListener('click', () => {
    loginModal.style.display = 'block';
});

// 关闭登录模态框
closeBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

// 点击模态框外部关闭
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// API地址配置
const API_URL = 'http://localhost:3000';

// 处理登录表单提交
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码');
        return;
    }
    
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
            localStorage.setItem('username', username);
            loginModal.style.display = 'none';
            updateLoginStatus();
        } else {
            const data = await response.json();
            alert(data.message || '登录失败，请检查用户名和密码');
        }
    } catch (error) {
        console.error('登录出错:', error);
        alert('登录过程中出现错误');
    }
});

// 更新登录状态
function updateLoginStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
        loginBtn.textContent = username;
        // 如果在文章页面，显示编辑按钮
        if (window.location.pathname.includes('articles.html')) {
            showEditControls();
        }
    } else {
        loginBtn.textContent = '登录';
        // 如果在文章页面，隐藏编辑按钮
        if (window.location.pathname.includes('articles.html')) {
            hideEditControls();
        }
    }
}

// 显示文章编辑控件
function showEditControls() {
    const editControls = document.querySelector('.edit-controls');
    if (editControls) {
        editControls.style.display = 'block';
    }
}

// 隐藏文章编辑控件
function hideEditControls() {
    const editControls = document.querySelector('.edit-controls');
    if (editControls) {
        editControls.style.display = 'none';
    }
}

// 页面加载时检查登录状态
document.addEventListener('DOMContentLoaded', updateLoginStatus);