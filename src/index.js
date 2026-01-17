const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 1. 导入数据库连接实例（新增）
const database = require('../config/db');

// 导入路由
const coupletsRouter = require('../api/couplets');
const categoriesRouter = require('../api/categories');
const searchRouter = require('../api/search');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// 性能优化中间件
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use(morgan('combined'));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: '请求过于频繁，请15分钟后再试。' }
});
app.use('/api/', limiter);

// 2. 核心：初始化数据库连接（新增）
// 适配Vercel Serverless：避免冷启动重复连接
const initDB = async () => {
  if (!database.isConnected) {
    try {
      await database.connect();
      console.log('📌 数据库首次连接成功');
    } catch (err) {
      console.error('📌 数据库连接失败:', err.message);
    }
  }
};

// 3. 所有请求前先确保数据库连接（新增中间件）
app.use(async (req, res, next) => {
  await initDB();
  next();
});

// 根路径响应
app.get('/', (req, res) => {
  // 新增：返回数据库连接状态
  const dbStatus = database.getStatus();
  res.json({
    message: '对联API服务已启动',
    version: '1.0.0',
    dbConnection: dbStatus, // 显示数据库连接状态
    endpoints: {
      couplets: '/api/couplets',
      categories: '/api/categories',
      search: '/api/search',
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// 健康检查端点（增强：包含数据库状态）
app.get('/health', (req, res) => {
  const dbStatus = database.getStatus();
  res.status(200).json({
    status: dbStatus.isConnected ? 'healthy' : 'unhealthy',
    database: dbStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API路由
app.use('/api/couplets', coupletsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `无法找到 ${req.method} ${req.url}`,
    suggestions: ['/api/couplets', '/api/categories', '/api/search']
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    error: 'Server Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Vercel需要导出app
module.exports = app;

// 本地开发时启动服务器
if (require.main === module) {
  // 本地启动时主动连接数据库
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📚 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⏰ 时间: ${new Date().toLocaleString()}`);
    });
  });
}