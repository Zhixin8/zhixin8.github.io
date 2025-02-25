# 知识花园系统

一个现代化的个人知识管理系统，帮助用户构建和管理自己的数字知识花园。

## 功能特点

- 📝 文章编写与管理
  - 支持Markdown格式编辑
  - 实时预览
  - 图片和附件上传
  - 草稿保存功能

- 📚 知识内容展示
  - 响应式布局设计
  - 清晰的导航结构
  - 优雅的阅读体验

- 🔧 系统功能
  - 用户认证和授权
  - 文件上传和管理
  - API接口支持

## 技术栈

### 前端
- HTML5/CSS3
- JavaScript
- 响应式设计

### 后端
- Node.js
- Express.js
- JWT认证
- LowDB数据存储

### 依赖包
- bcryptjs: 密码加密
- body-parser: 请求体解析
- cors: 跨域资源共享
- express: Web应用框架
- jsonwebtoken: JWT认证
- multer: 文件上传处理
- lowdb: JSON文件数据库

## 快速开始

### 环境要求
- Node.js (推荐 v14+)
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖
```bash
# 安装服务端依赖
cd server
npm install

# 返回项目根目录
cd ..
```

3. 启动服务
```bash
# 启动服务端
cd server
npm start
```

4. 访问系统
- 打开浏览器访问 `http://localhost:3000`

## 项目结构

```
├── articles/          # 文章HTML文件
├── server/            # 后端服务
│   ├── server.js      # 服务器入口文件
│   └── package.json   # 后端依赖配置
├── .gitignore        # Git忽略配置
└── write.html        # 文章编辑页面
```

## 使用说明

### 文章编写
1. 点击导航栏的写作按钮
2. 使用富文本编辑器编写内容
3. 可插入图片、链接和附件
4. 使用工具栏进行格式化
5. 可保存草稿或直接发布

### 文章管理
- 支持文章的编辑和删除
- 提供草稿保存功能
- 可进行文章分类和标签管理

## 注意事项

- 请定期备份数据库文件
- 上传文件大小限制为10MB
- 建议使用现代浏览器访问系统

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目。

## 许可证

本项目采用 MIT 许可证。