# 对联知识库 - API服务

## 项目概述
这是对联知识库小程序的RESTful API服务，提供对联数据的查询、搜索和管理功能。

## 技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MongoDB (模拟数据/真实数据)
- **缓存**: Redis (可选)
- **容器**: Docker & Docker Compose

## 功能特性
- ✅ RESTful API设计
- ✅ 数据分页和过滤
- ✅ 全文搜索功能
- ✅ 分类管理
- ✅ 速率限制
- ✅ 安全中间件
- ✅ 健康检查
- ✅ 日志记录

## API接口文档

### 基础信息
- **Base URL**: `https://api.yourdomain.com`
- **API版本**: v1
- **响应格式**: JSON

### 健康检查
```
GET /health
```
返回服务器健康状态信息。

### 对联接口

#### 获取对联列表
```
GET /api/couplets
```
**查询参数**:
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10
- `recommended` (可选): 是否只获取推荐对联 (true/false)
- `category` (可选): 按分类筛选

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "春节经典对联",
      "upper_line": "天增岁月人增寿",
      "lower_line": "春满乾坤福满门",
      "category": "春节",
      "tags": ["春节", "祝福", "传统"],
      "views": 100,
      "favorites": 50
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### 获取对联详情
```
GET /api/couplets/:id
```
**路径参数**:
- `id`: 对联ID

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "春节经典对联",
    "upper_line": "天增岁月人增寿",
    "lower_line": "春满乾坤福满门",
    "category": "春节",
    "description": "这是一副经典的春节对联...",
    "author": "传统",
    "origin": "中国传统春节对联",
    "meaning": "表达对新年的美好祝愿...",
    "usage": "适用于大门、客厅等显眼位置",
    "tags": ["春节", "祝福", "传统"],
    "recommended": true,
    "created_at": "2026-01-01",
    "views": 101,
    "favorites": 50
  }
}
```

#### 获取推荐对联
```
GET /api/couplets/recommended
```
**查询参数**:
- `limit` (可选): 返回数量，默认5

#### 获取随机对联
```
GET /api/couplets/random
```
**查询参数**:
- `limit` (可选): 返回数量，默认3

### 搜索接口

#### 搜索对联
```
GET /api/search
```
**查询参数**:
- `q` (可选): 搜索关键词
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认10
- `category` (可选): 按分类筛选
- `sort` (可选): 排序方式 (relevance/views/favorites/date)，默认relevance

#### 获取热门搜索
```
GET /api/search/hot
```
**查询参数**:
- `limit` (可选): 返回数量，默认10

#### 获取搜索建议
```
GET /api/search/suggestions
```
**查询参数**:
- `q`: 搜索关键词 (必需)

### 分类接口

#### 获取分类列表
```
GET /api/categories
```

#### 获取分类详情
```
GET /api/categories/:id
```

## 部署指南

### 1. 本地开发环境

#### 1.1 环境要求
- Node.js 18+
- MongoDB (可选，使用模拟数据时不需要)
- Redis (可选)

#### 1.2 安装步骤
```bash
# 克隆项目
git clone [项目地址]
cd couplets-app/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置你的环境变量

# 启动开发服务器
npm run dev
```

#### 1.3 开发服务器
- 地址: http://localhost:3000
- 健康检查: http://localhost:3000/health
- API文档: http://localhost:3000/api/[route]/docs

### 2. Docker部署

#### 2.1 使用Docker Compose
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f api

# 停止服务
docker-compose down
```

#### 2.2 服务端口
- API服务: http://localhost:3000
- MongoDB: localhost:27017
- Redis: localhost:6379
- Nginx: http://localhost:80
- Grafana: http://localhost:3001

### 3. 生产环境部署

#### 3.1 服务器要求
- Linux服务器 (Ubuntu 20.04+ / CentOS 8+)
- Docker & Docker Compose
- 域名和SSL证书

#### 3.2 部署步骤
```bash
# 1. 上传项目到服务器
scp -r couplets-app user@your-server:/opt/

# 2. 登录服务器
ssh user@your-server

# 3. 进入项目目录
cd /opt/couplets-app/backend

# 4. 配置生产环境变量
nano .env.production

# 5. 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 6. 配置Nginx和SSL
# 参考 nginx/ 目录下的配置文件
```

#### 3.3 监控和日志
- 日志目录: `./logs/`
- 监控面板: http://your-server:3001
- 日志轮转: 使用logrotate配置

## 配置说明

### 环境变量
```
# 应用配置
NODE_ENV=development/production
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=27017
DB_NAME=couplets_db
DB_USER=your_user
DB_PASSWORD=your_password

# 缓存配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# 安全配置
JWT_SECRET=your_jwt_secret
API_KEY=your_api_key

# CORS配置
ALLOWED_ORIGINS=http://localhost:8080,https://yourdomain.com
```

### 速率限制
- 窗口: 15分钟
- 最大请求数: 100次/IP
- 超过限制返回: "请求过于频繁，请稍后再试"

## 开发指南

### 1. 项目结构
```
backend/
├── src/                 # 源代码目录
│   └── index.js        # 应用入口
├── config/             # 配置文件
├── routes/             # 路由定义
├── controllers/        # 控制器
├── models/             # 数据模型
├── middleware/         # 中间件
├── tests/              # 测试文件
├── .env.example        # 环境变量示例
├── package.json        # 依赖配置
├── Dockerfile          # Docker构建文件
└── docker-compose.yml  # 容器编排
```

### 2. 添加新接口
1. 在 `controllers/` 创建新的控制器
2. 在 `routes/` 创建新的路由
3. 在 `src/index.js` 中注册路由
4. 添加API文档端点

### 3. 测试
```bash
# 运行单元测试
npm test

# 运行集成测试
npm run test:integration

# 生成测试覆盖率报告
npm run test:coverage
```

## 性能优化

### 1. 缓存策略
- 热门数据使用Redis缓存
- 设置合理的缓存过期时间
- 使用内存缓存高频查询

### 2. 数据库优化
- 创建合适的索引
- 使用连接池
- 定期清理无用数据

### 3. 代码优化
- 使用异步操作
- 避免内存泄漏
- 压缩响应数据

## 安全措施

### 1. 输入验证
- 所有输入参数都经过验证
- 防止SQL注入
- 防止XSS攻击

### 2. 身份验证
- API密钥验证
- JWT令牌验证
- 会话管理

### 3. 防护措施
- CORS配置
- 速率限制
- 请求大小限制

## 故障排除

### 1. 常见问题
```
Q: 服务器启动失败
A: 检查端口是否被占用，环境变量是否配置正确

Q: 数据库连接失败
A: 检查数据库服务是否运行，连接字符串是否正确

Q: API响应慢
A: 检查数据库查询性能，增加缓存
```

### 2. 日志查看
```bash
# 查看API日志
tail -f logs/app.log

# 查看Docker容器日志
docker-compose logs -f api

# 查看错误日志
grep ERROR logs/app.log
```

## 更新和维护

### 1. 版本更新
1. 备份当前数据和配置
2. 拉取最新代码
3. 更新依赖
4. 运行测试
5. 重启服务

### 2. 数据备份
```bash
# 备份MongoDB数据
mongodump --db couplets_db --out /backup/$(date +%Y%m%d)

# 备份Redis数据
redis-cli SAVE
cp /var/lib/redis/dump.rdb /backup/
```

## 许可证
MIT License - 详见 LICENSE 文件