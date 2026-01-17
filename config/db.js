// config/db.js
const mongoose = require('mongoose');

class Database {
  constructor() {
    this.isConnected = false;
  }

  async connect() {
    try {
      // Vercel环境变量名通常是MONGODB_URI
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/couplets';
      
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      this.isConnected = true;
      console.log('✅ MongoDB Connected successfully');
      
      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        this.isConnected = false;
      });
      
      mongoose.connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
        this.isConnected = false;
      });
      
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('MongoDB disconnected');
    } catch (error) {
      console.error('Error disconnecting MongoDB:', error);
    }
  }

  getConnection() {
    return mongoose.connection;
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }
}

// 导出单例实例
const database = new Database();
module.exports = database;