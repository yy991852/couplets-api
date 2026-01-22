// models/CoupletAdapter.js
const CoupletModel = require('./CoupletModel');
const database = require('../config/db');

class CoupletDatabase {
  constructor() {
    this.db = database;
    // 移除初始化连接，在方法中按需连接
  }

  // 确保数据库连接
  async ensureConnection() {
    if (!this.db.isConnected) {
      try {
        await this.db.connect();
        console.log('✅ MongoDB连接成功（coupletsCt集合）');
      } catch (error) {
        console.error('❌ MongoDB连接失败:', error.message);
        throw new Error('数据库连接失败，请检查配置');
      }
    }
  }

  // 代理调用Model方法
  async getCategories() {
    await this.ensureConnection();
    return await CoupletModel.getCategories();
  }

  async getAllCouplets(options) {
    await this.ensureConnection();
    return await CoupletModel.getAllCouplets(options);
  }

  async getCoupletById(id) {
    await this.ensureConnection();
    return await CoupletModel.getCoupletById(id);
  }

  async getRandomCouplets(limit) {
    await this.ensureConnection();
    return await CoupletModel.getRandomCouplets(limit);
  }

  async updateFavoriteCount(id, increment) {
    await this.ensureConnection();
    return await CoupletModel.updateFavoriteCount(id, increment);
  }

  async searchCouplets(query, options) {
    await this.ensureConnection();
    return await CoupletModel.searchCouplets(query, options);
  }
}

// 导出单例
const coupletDB = new CoupletDatabase();
module.exports = coupletDB;