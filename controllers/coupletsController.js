// controllers/coupletsController.js
const coupletDB = require('../models/CoupletAdapter');

// 1. 获取所有对联（带分页/筛选）
exports.getAllCouplets = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, recommended } = req.query;
    const result = await coupletDB.getAllCouplets({
      page,
      limit,
      category,
      recommended
    });
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('获取对联列表失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

// 2. 获取单条对联详情（✅ 导出方法名：getCoupletDetail）
exports.getCoupletDetail = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: '对联ID必须是有效数字'
      });
    }
    const couplet = await coupletDB.getCoupletById(id);
    if (!couplet) {
      return res.status(404).json({
        success: false,
        error: '该对联不存在'
      });
    }
    res.status(200).json({
      success: true,
      data: couplet
    });
  } catch (error) {
    console.error('获取对联详情失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

// controllers/coupletsController.js

// 1. 获取随机对联（无ID校验）
exports.getRandomCouplets = async (req, res) => {
  try {
    const { limit = 3 } = req.query;
    // 仅校验limit是否为数字，无ID校验
    const validLimit = Math.max(1, Math.min(10, parseInt(limit) || 3));
    const couplets = await coupletDB.getRandomCouplets(validLimit);
    
    res.status(200).json({
      success: true,
      data: couplets
    });
  } catch (error) {
    console.error('获取随机对联失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

// 3. 搜索对联（无ID校验）
exports.searchCouplets = async (req, res) => {
  try {
    const { q = '', page = 1, limit = 10 } = req.query;
    // 仅校验page/limit，无ID校验
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.max(1, Math.min(50, parseInt(limit) || 10));
    
    const result = await coupletDB.searchCouplets(q, { 
      page: validPage, 
      limit: validLimit 
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('搜索对联失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

 

// 5. 更新收藏数（✅ 导出方法名：updateCoupletFavorite）
exports.updateCoupletFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'increment' } = req.body;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: '对联ID必须是有效数字'
      });
    }
    const newCount = await coupletDB.updateFavoriteCount(
      id,
      action === 'increment'
    );
    if (newCount === null) {
      return res.status(404).json({
        success: false,
        error: '更新收藏数失败，对联不存在'
      });
    }
    res.status(200).json({
      success: true,
      data: { favorite_count: newCount }
    });
  } catch (error) {
    console.error('更新收藏数失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};