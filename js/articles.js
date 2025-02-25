// 静态文章数据
const articles = [
    {
        id: 'minimalist-life',
        title: '极简主义生活的实践之路',
        date: '2024-01-15',
        excerpt: '如何通过极简主义理念，让生活变得变得更加轻盈自在...',
        readingTime: '10分钟'
    },
    {
        id: 'creative-thinking',
        title: '创意思维：突破思维局限的实践方法',
        date: '2024-01-15',
        excerpt: '在日常生活和工作中，我们经常会遇到思维局限的困境...',
        readingTime: '8分钟'
    },
    {
        id: 'knowledge-management',
        title: '知识管理方法论：构建个人知识体系的实践指南',
        date: '2024-01-15',
        excerpt: '在信息爆炸的时代，如何有效管理和利用知识成为一个重要课题...',
        readingTime: '12分钟'
    },
    {
        id: 'urban-cycling',
        title: '城市骑行指南',
        date: '2024-01-10',
        excerpt: '探索城市角落的最佳方式，让骑行成为生活方式...',
        readingTime: '15分钟'
    },
    {
        id: 'digital-focus',
        title: '数字时代的专注力：如何在信息洪流中保持清醒',
        date: '2024-01-05',
        excerpt: '在这个数字化时代，我们每天都面临着前所未有的信息轰炸...',
        readingTime: '10分钟'
    },
    {
        id: 'productivity-guide',
        title: '效率提升指南：如何打造高效的工作流程',
        date: '2024-01-03',
        excerpt: '在当今快节奏的工作环境中，如何提高工作效率成为关键...',
        readingTime: '8分钟'
    },
    {
        id: 'ai-learning',
        title: '数字时代的学习革命：AI辅助学习的新范式',
        date: '2024-01-01',
        excerpt: 'AI技术的发展正在改变我们的学习方式...',
        readingTime: '10分钟'
    }
];

// 全局变量存储分页信息
let currentPage = 1;
let totalPages = Math.ceil(articles.length / 5);
const articlesPerPage = 5;

// 在页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    loadArticles(1);
});

// 加载文章列表
function loadArticles(page) {
    const articlesGrid = document.querySelector('.articles-grid');
    currentPage = page;

    // 对文章按日期倒序排序
    const sortedArticles = [...articles].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // 计算当前页的文章
    const start = (page - 1) * articlesPerPage;
    const end = start + articlesPerPage;
    const pageArticles = sortedArticles.slice(start, end);

    displayArticles(pageArticles);
    if (totalPages > 1) {
        displayPagination();
    }
}

// 显示加载状态
function showLoadingState(container) {
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>正在加载文章列表...</p>
        </div>
    `;
}

// 显示错误状态
function showErrorState(container, errorMessage = '加载文章列表失败') {
    container.innerHTML = `
        <div class="error-state">
            <p>${errorMessage}</p>
            <button class="retry-button" onclick="loadArticles(currentPage)">重试</button>
        </div>
    `;
}

// 显示文章列表
function displayArticles(articles) {
    const articlesGrid = document.querySelector('.articles-grid');
    articlesGrid.innerHTML = ''; // 清空现有内容

    if (articles.length === 0) {
        articlesGrid.innerHTML = '<p class="no-articles">暂无文章</p>';
        return;
    }

    articles.forEach(article => {
        const date = new Date(article.date);
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

        const articleHtml = `
            <article class="article-card">
                <div class="article-content">
                    <div class="article-meta">
                        <span class="article-date">${formattedDate}</span>
                        <span class="article-reading-time">${article.readingTime}</span>
                    </div>
                    <h2 class="article-title">
                        <a href="articles/${article.id}.html">${article.title}</a>
                    </h2>
                    <p class="article-excerpt">${article.excerpt}</p>
                    <a href="articles/${article.id}.html" class="read-more">阅读更多</a>
                </div>
            </article>
        `;

        articlesGrid.insertAdjacentHTML('beforeend', articleHtml);
    });
}

// 显示分页控件
function displayPagination() {
    // 移除已存在的分页控件
    const existingPagination = document.querySelector('.pagination');
    if (existingPagination) {
        existingPagination.remove();
    }

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    
    let paginationHtml = '';
    
    // 上一页按钮
    paginationHtml += `
        <button 
            class="pagination-button" 
            onclick="loadArticles(${currentPage - 1})"
            ${currentPage === 1 ? 'disabled' : ''}
        >上一页</button>
    `;

    // 页码按钮
    for (let i = 1; i <= totalPages; i++) {
        paginationHtml += `
            <button 
                class="pagination-button ${i === currentPage ? 'active' : ''}"
                onclick="loadArticles(${i})"
            >${i}</button>
        `;
    }

    // 下一页按钮
    paginationHtml += `
        <button 
            class="pagination-button" 
            onclick="loadArticles(${currentPage + 1})"
            ${currentPage === totalPages ? 'disabled' : ''}
        >下一页</button>
    `;

    paginationContainer.innerHTML = paginationHtml;
    document.querySelector('.articles-section').appendChild(paginationContainer);
}

// 获取文章摘要
function getExcerpt(content) {
    // 检查content是否为undefined或null
    if (!content) {
        return '';
    }
    // 移除HTML标签
    const plainText = content.replace(/<[^>]+>/g, '');
    // 返回前100个字符
    return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText;
}