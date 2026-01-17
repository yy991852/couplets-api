const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 导入路由
const coupletsRouter = require('../routes/couplets');
const categoriesRouter = require('../routes/categories');
const searchRouter = require('../routes/search');

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 安全中间件
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));

// 性能优化中间件
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  message: '请求过于频繁，请稍后再试。'
});
app.use('/api/', limiter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
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
    message: `无法找到 ${req.method} ${req.url}`
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

// 启动服务器
// if (process.env.NODE_ENV !== 'test') {
//   app.listen(PORT, () => {
//     console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
//     console.log(`📚 环境: ${process.env.NODE_ENV || 'development'}`);
//     console.log(`⏰ 时间: ${new Date().toLocaleString()}`);
//   });
// }

module.exports = app;