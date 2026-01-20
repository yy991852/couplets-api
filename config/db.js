// config/db.js
const mongoose = require('mongoose');

class Database {
  constructor() {
    this.isConnected = false;
  }

  // 🔴 恢复默认参数，同时校验是否为远程地址
  async connect(mongoUri = process.env.MONGODB_URI) {
    // 1. 校验环境变量是否配置
    if (!mongoUri) {
      throw new Error('❌ MONGODB_URI 环境变量未配置！');
    }

    // 2. 禁止连接本地数据库
    if (mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
      throw new Error('❌ 禁止连接本地 MongoDB！请配置远程 MONGODB_URI');
    }

    try {
      // Mongoose 6+ 无需额外参数
      await mongoose.connect(mongoUri);
      
      this.isConnected = true;
      console.log('✅ 远程 MongoDB 连接成功！');
      
      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB 连接异常:', err.message);
        this.isConnected = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB 连接断开');
        this.isConnected = false;
      });
      
    } catch (error) {
      console.error('❌ MongoDB 连接失败:', error.message);
      this.isConnected = false;
      throw error; // 抛出错误，让上层处理
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ MongoDB 已断开连接');
    } catch (error) {
      console.error('❌ 断开 MongoDB 失败:', error.message);
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState, // 0=断开,1=连接,2=连接中,3=断开中
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'couplets'
    };
  }
}

// 导出单例实例
const database = new Database();
module.exports = database;