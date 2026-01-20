// models/CoupletAdapter.js
const CoupletModel = require('./CoupletModel');
const database = require('../config/db');

class CoupletDatabase {
  constructor() {
    this.db = database;
    this.initialize();
  }

  // 初始化MongoDB连接
  async initialize() {
    try {
      await this.db.connect();
      console.log('✅ MongoDB连接成功（coupletsCt集合）');
    } catch (error) {
      console.error('❌ MongoDB连接失败:', error.message);
      throw new Error('数据库连接失败，请检查配置');
    }
  }

  // 代理调用Model方法
  async getCategories() {
    return await CoupletModel.getCategories();
  }

  async getAllCouplets(options) {
    return await CoupletModel.getAllCouplets(options);
  }

  async getCoupletById(id) {
    return await CoupletModel.getCoupletById(id);
  }

  async getRandomCouplets(limit) {
    return await CoupletModel.getRandomCouplets(limit);
  }

  async updateFavoriteCount(id, increment) {
    return await CoupletModel.updateFavoriteCount(id, increment);
  }

  async searchCouplets(query, options) {
    return await CoupletModel.searchCouplets(query, options);
  }
}

// 导出单例
const coupletDB = new CoupletDatabase();
module.exports = coupletDB;