// controllers/categoriesController.js
const coupletDB = require('../models/CoupletAdapter');

// 1. 获取所有分类
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await coupletDB.getCategories();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

// 2. 获取分类详情（含该分类下的对联）
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: '分类ID必须是有效数字'
      });
    }
    // 获取分类信息
    const categories = await coupletDB.getCategories();
    const category = categories.find(cat => cat.id === parseInt(id));
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '分类不存在'
      });
    }
    // 获取该分类下的对联
    const coupletsResult = await coupletDB.getAllCouplets({
      page,
      limit,
      category: id
    });
    res.status(200).json({
      success: true,
      data: {
        category,
        couplets: coupletsResult.data,
        pagination: coupletsResult.pagination
      }
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

// 3. 获取分类统计
exports.getCategoryStats = async (req, res) => {
  try {
    const categories = await coupletDB.getCategories();
    const totalCategories = categories.length;
    const totalCouplets = categories.reduce((sum, cat) => sum + (cat.count || 0), 0);
    const avgCoupletsPerCategory = totalCategories > 0 ? (totalCouplets / totalCategories).toFixed(1) : 0;
    // 热门分类（前5）
    const hotCategories = [...categories]
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 5);
    res.status(200).json({
      success: true,
      data: {
        totalCategories,
        totalCouplets,
        avgCoupletsPerCategory,
        hotCategories,
        categories: categories.map(cat => ({
          id: cat.id,
          name: cat.name,
          count: cat.count || 0,
          percentage: totalCouplets > 0 ? ((cat.count || 0) / totalCouplets * 100).toFixed(1) + '%' : '0%'
        }))
      }
    });
  } catch (error) {
    console.error('获取分类统计失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};

// 4. 获取分类分布（带颜色）
exports.getCategoryDistribution = async (req, res) => {
  try {
    const categories = await coupletDB.getCategories();
    // 随机生成颜色（用于前端展示）
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };
    const distribution = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: cat.count || 0,
      color: getRandomColor(),
      percentage: categories.reduce((sum, c) => sum + (c.count || 0), 0) > 0 
        ? ((cat.count || 0) / categories.reduce((sum, c) => sum + (c.count || 0), 0) * 100).toFixed(1) + '%' 
        : '0%'
    }));
    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('获取分类分布失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      message: error.message
    });
  }
};