// config/db.js - 优化版
const mongoose = require('mongoose');

// 全局缓存连接，避免每次函数调用都创建新连接
let cachedConnection = null;

// 防止开发环境下的热重载重复连接
if (process.env.NODE_ENV === 'development') {
  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
  }
}

async function connectDB() {
  // 如果已有缓存连接且状态正常，直接复用
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ 使用缓存的MongoDB连接');
    return cachedConnection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI环境变量未设置');
    }

    // Serverless环境优化配置
    const options = {
      maxPoolSize: 10,           // 连接池最大连接数
      minPoolSize: 2,            // 连接池最小连接数
      socketTimeoutMS: 45000,    // Socket超时时间
      serverSelectionTimeoutMS: 5000, // 服务器选择超时
      heartbeatFrequencyMS: 10000, // 心跳检测频率
    };

    console.log('🔄 创建新的MongoDB连接...');
    
    // 建立连接
    const connection = await mongoose.connect(mongoUri, options);
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB连接错误:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB连接断开');
      cachedConnection = null;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔁 MongoDB重新连接成功');
    });

    // 缓存连接
    cachedConnection = connection;
    console.log(`✅ MongoDB连接成功: ${mongoose.connection.host}`);
    
    return connection;
  } catch (error) {
    console.error('❌ MongoDB连接失败:', error.message);
    
    // 针对常见错误的友好提示
    if (error.name === 'MongoServerSelectionError') {
      console.error('💡 请检查:');
      console.error('1. MongoDB Atlas IP白名单是否正确');
      console.error('2. 数据库用户名密码是否正确');
      console.error('3. 网络连接是否正常');
    }
    
    throw error;
  }
}

// 获取连接状态的函数
function getConnectionStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    stateName: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || 'unknown',
    dbName: mongoose.connection.name || 'unknown',
    models: Object.keys(mongoose.models || {}),
  };
}

// 健康检查函数
async function healthCheck() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    // 执行一个简单查询确认连接可用
    await mongoose.connection.db.admin().ping();
    return { 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      ...getConnectionStatus()
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message,
      timestamp: new Date().toISOString(),
      ...getConnectionStatus()
    };
  }
}

// Serverless环境专用：优化冷启动
module.exports = {
  connectDB,
  getConnectionStatus,
  healthCheck,
  // 导出mongoose实例供直接使用
  mongoose
};