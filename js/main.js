// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 导航栏滚动效果
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.nav');
        if (window.scrollY > 50) {
            nav.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            nav.style.backgroundColor = '#fff';
        }
    });

    // 为将来的功能预留空间
    // 可以在这里添加更多的交互功能
});