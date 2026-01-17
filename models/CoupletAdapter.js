// models/CoupletAdapter.js
const CoupletModel = require('./CoupletModel');
const database = require('../config/db');

class CoupletDatabase {
  constructor() {
    this.db = database;
    this.initialize();
  }

  async initialize() {
    try {
      await this.db.connect();
      console.log('MongoDB适配器初始化完成');
    } catch (error) {
      console.warn('MongoDB连接失败，将使用内存存储:', error.message);
      this.useMemory = true;
      this.memoryStorage = new Map();
    }
  }

  async getAllCouplets(options = {}) {
    if (this.useMemory) {
      // 内存模式（兼容旧代码）
      return this.memoryGetAllCouplets(options);
    }
    
    return await CoupletModel.getAllCouplets(options);
  }

  async getCoupletById(id) {
    if (this.useMemory) {
      return this.memoryGetCoupletById(id);
    }
    
    return await CoupletModel.getCoupletById(id);
  }

  async searchCouplets(query, options = {}) {
    if (this.useMemory) {
      return this.memorySearchCouplets(query, options);
    }
    
    return await CoupletModel.searchCouplets(query, options);
  }

  async getCategories() {
    if (this.useMemory) {
      return this.memoryGetCategories();
    }
    
    return await CoupletModel.getCategories();
  }

  async getRandomCouplets(limit = 3) {
    if (this.useMemory) {
      return this.memoryGetRandomCouplets(limit);
    }
    
    return await CoupletModel.getRandomCouplets(limit);
  }

  async updateFavoriteCount(id, increment = true) {
    if (this.useMemory) {
      return this.memoryUpdateFavoriteCount(id, increment);
    }
    
    return await CoupletModel.updateFavoriteCount(id, increment);
  }

  // 内存存储方法（兼容模式）
  memoryGetAllCouplets(options = {}) {
    let results = Array.from(this.memoryStorage.values());
    
    // ... 实现你的内存存储逻辑 ...
  }
  
  // ... 其他内存存储方法的实现 ...
}

// 导出实例
const coupletDB = new CoupletDatabase();
module.exports = coupletDB;