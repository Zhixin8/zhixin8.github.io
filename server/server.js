const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// 设置数据库
const adapter = new FileSync('db.json');
const db = low(adapter);

// 设置默认数据
db.defaults({ thoughts: [], articles: [], users: [] }).write();

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// JWT密钥
const JWT_SECRET = 'your-secret-key';

// 验证JWT中间件
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: '未提供认证令牌' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: '无效的认证令牌' });
        }
        req.user = user;
        next();
    });
};

// 用户注册
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 检查用户是否已存在
        const existingUser = db.get('users')
            .find({ username })
            .value();

        if (existingUser) {
            return res.status(400).json({ message: '用户名已存在' });
        }

        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户
        const user = {
            id: Date.now().toString(),
            username,
            password: hashedPassword
        };

        db.get('users')
            .push(user)
            .write();

        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 用户登录
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 查找用户
        const user = db.get('users')
            .find({ username })
            .value();

        if (!user) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }

        // 生成JWT
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 发布说说
app.post('/api/thoughts', authenticateToken, (req, res) => {
    try {
        const { content, tags, createdAt } = req.body;
        const thought = {
            id: Date.now().toString(),
            content,
            tags: tags || [],
            author: req.user.username,
            createdAt: createdAt || new Date().toISOString()
        };

        db.get('thoughts')
            .push(thought)
            .write();

        res.status(201).json(thought);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取所有说说
app.get('/api/thoughts', (req, res) => {
    try {
        const thoughts = db.get('thoughts')
            .orderBy(['createdAt'], ['desc'])
            .value();

        res.json(thoughts);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 发布文章
app.post('/api/articles', authenticateToken, (req, res) => {
    try {
        const { title, content, tags, createdAt } = req.body;
        const article = {
            id: Date.now().toString(),
            title,
            content,
            tags: tags || [],
            author: req.user.username,
            createdAt: createdAt || new Date().toISOString()
        };

        // 如果有封面图片，这里需要处理图片上传
        // 实际项目中应该将图片保存到文件系统或云存储
        if (req.files && req.files.coverImage) {
            article.coverImage = req.files.coverImage.name;
        }

        db.get('articles')
            .push(article)
            .write();

        res.status(201).json(article);
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 获取所有文章
app.get('/api/articles', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;

        const articles = db.get('articles')
            .orderBy(['createdAt'], ['desc'])
            .value();

        const paginatedArticles = articles.slice(startIndex, startIndex + limit);
        const total = articles.length;

        res.json({
            articles: paginatedArticles,
            total: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: '服务器错误' });
    }
});

// 创建文章HTML文件
app.post('/api/create-article', authenticateToken, (req, res) => {
    try {
        const { id, content } = req.body;
        const articlesDir = path.join(__dirname, '..', 'articles');

        // 确保articles目录存在
        if (!fs.existsSync(articlesDir)) {
            fs.mkdirSync(articlesDir);
        }

        const filePath = path.join(articlesDir, `${id}.html`);
        fs.writeFileSync(filePath, content, 'utf8');

        res.status(201).json({ message: '文章文件创建成功' });
    } catch (error) {
        console.error('创建文章文件失败:', error);
        res.status(500).json({ message: '创建文章文件失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});