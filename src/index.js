const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// 🔴 优先加载.env文件（根目录）
dotenv.config();

// 🔴 校验MONGODB_URI是否配置
if (!process.env.MONGODB_URI) {
  console.error('❌ 错误：未配置 MONGODB_URI 环境变量！');
  console.error('👉 请在 .env 文件中配置远程 MongoDB 连接字符串');
  process.exit(1);
}

// 导入数据库连接实例
const database = require('../config/db');

// 🔴 修正：导入路由（保持原有路径，确保api目录下的文件存在）
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

// 🔴 修正：初始化数据库连接（无需传参，自动读.env）
const initDB = async () => {
  if (!database.isConnected) {
    try {
      await database.connect(); // 🔴 关键：去掉参数，直接调用
      console.log('📌 远程 MongoDB 首次连接成功');
    } catch (err) {
      console.error('📌 远程 MongoDB 连接失败:', err.message);
      // 连接失败时不退出，使用内存存储（兼容你的业务逻辑）
      console.log('⚠️ MongoDB 连接失败，将使用内存存储');
    }
  }
};

// 所有请求前确保数据库连接
app.use(async (req, res, next) => {
  try {
    await initDB();
    next();
  } catch (err) {
    res.status(503).json({
      success: false,
      message: '数据库连接失败，请稍后重试',
      error: process.env.NODE_ENV === 'development' ? err.message : '',
      timestamp: new Date().toISOString()
    });
  }
});

// 根路径响应（补充接口文档，方便测试）
app.get('/', (req, res) => {
  const dbStatus = database.getStatus();
  res.json({
    message: '对联API服务已启动',
    version: '1.0.0',
    dbConnection: {
      isConnected: dbStatus.isConnected,
      readyState: dbStatus.readyState,
      host: dbStatus.host ? 'remote-mongodb' : 'unknown'
    },
    // 🔴 补充完整的测试接口列表
    endpoints: {
      // 对联接口
      couplets_list: 'GET /api/couplets?page=1&limit=10&category=1',
      couplets_detail: 'GET /api/couplets/1',
      couplets_random: 'GET /api/couplets/random?limit=3',
      couplets_search: 'GET /api/couplets/search?q=春节',
      couplets_favorite: 'PATCH /api/couplets/1/favorites (body: {action: "increment"})',
      // 分类接口
      categories_list: 'GET /api/categories',
      categories_detail: 'GET /api/categories/1',
      categories_stats: 'GET /api/categories/stats',
      // 健康检查
      health: '/health'
    },
    timestamp: new Date().toISOString()
  });
});

// 健康检查端点
app.get('/health', (req, res) => {
  const dbStatus = database.getStatus();
  res.status(dbStatus.isConnected ? 200 : 503).json({
    status: dbStatus.isConnected ? 'healthy' : 'unhealthy',
    database: {
      isConnected: dbStatus.isConnected,
      readyState: dbStatus.readyState
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// 🔴 核心：挂载API路由（无需修改，已适配）
app.use('/api/couplets', coupletsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/search', searchRouter);

// 404处理（优化提示信息）
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `无法找到 ${req.method} ${req.url}`,
    // 🔴 补充常用接口提示
    suggestions: [
      'GET /api/couplets (获取对联列表)',
      'GET /api/categories (获取分类列表)',
      'GET /api/couplets/random (获取随机对联)'
    ],
    timestamp: new Date().toISOString()
  });
});

// 错误处理中间件（优化返回格式，适配控制器的错误逻辑）
app.use((err, req, res, next) => {
  console.error('服务器错误:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? '服务器内部错误' 
    : err.message || '服务器内部错误';
  
  res.status(statusCode).json({
    success: false,
    error: 'Server Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// Vercel导出app
module.exports = app;

// 本地启动服务器（优化启动日志）
if (require.main === module) {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
      console.log(`📚 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 连接远程 MongoDB（集合名：coupletsCt）`);
      console.log(`📖 访问 http://localhost:${PORT} 查看所有可用接口`);
      console.log(`⏰ 时间: ${new Date().toLocaleString()}`);
    });
  }).catch(err => {
    console.error('❌ 本地启动失败：', err.message);
    // 连接失败仍启动服务（使用内存存储）
    app.listen(PORT, () => {
      console.log(`🚀 服务器降级运行在 http://localhost:${PORT}（使用内存存储）`);
      console.log(`⚠️ 注意：内存存储模式下数据仅临时有效`);
    });
  });
}