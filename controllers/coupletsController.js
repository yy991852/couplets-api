const { coupletDB } = require('../models/Couplet');

// 获取所有对联
exports.getAllCouplets = (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      recommended, 
      category 
    } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      recommended: recommended === 'true' ? true : (recommended === 'false' ? false : undefined),
      category: category || undefined
    };
    
    const result = coupletDB.getAllCouplets(options);
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('获取对联列表错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取单个对联详情
exports.getCoupletById = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: '无效的对联ID'
      });
    }
    
    const couplet = coupletDB.getCoupletById(id);
    
    if (!couplet) {
      return res.status(404).json({
        success: false,
        error: '对联不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: couplet
    });
  } catch (error) {
    console.error('获取对联详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取推荐对联
exports.getRecommendedCouplets = (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const result = coupletDB.getAllCouplets({
      recommended: true,
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取推荐对联错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取随机对联
exports.getRandomCouplets = (req, res) => {
  try {
    const { limit = 3 } = req.query;
    
    const randomCouplets = coupletDB.getRandomCouplets(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: randomCouplets
    });
  } catch (error) {
    console.error('获取随机对联错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取相关对联
exports.getRelatedCouplets = (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 3 } = req.query;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: '无效的对联ID'
      });
    }
    
    const currentCouplet = coupletDB.getCoupletById(id);
    if (!currentCouplet) {
      return res.status(404).json({
        success: false,
        error: '对联不存在'
      });
    }
    
    // 获取相同分类的对联（排除当前对联）
    const allCouplets = coupletDB.getAllCouplets({ category: currentCouplet.category });
    const relatedCouplets = allCouplets.data
      .filter(c => c.id !== parseInt(id))
      .slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: relatedCouplets
    });
  } catch (error) {
    console.error('获取相关对联错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 更新收藏数
exports.updateFavoriteCount = (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'increment' } = req.body;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        error: '无效的对联ID'
      });
    }
    
    const increment = action === 'increment';
    const newCount = coupletDB.updateFavoriteCount(id, increment);
    
    if (newCount === null) {
      return res.status(404).json({
        success: false,
        error: '对联不存在'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: parseInt(id),
        favorites: newCount,
        action: increment ? 'incremented' : 'decremented'
      }
    });
  } catch (error) {
    console.error('更新收藏数错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};