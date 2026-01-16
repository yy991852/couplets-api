const { coupletDB } = require('../models/Couplet');

// 获取所有分类
exports.getAllCategories = (req, res) => {
  try {
    const categories = coupletDB.getCategories();
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取单个分类详情
exports.getCategoryById = (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: '分类ID不能为空'
      });
    }
    
    const categories = coupletDB.getCategories();
    const category = categories.find(cat => cat.id === id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '分类不存在'
      });
    }
    
    // 获取该分类下的对联
    const coupletsResult = coupletDB.getAllCouplets({
      category: category.name,
      page: 1,
      limit: 20
    });
    
    res.status(200).json({
      success: true,
      data: {
        category: category,
        couplets: coupletsResult.data,
        pagination: coupletsResult.pagination
      }
    });
  } catch (error) {
    console.error('获取分类详情错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取分类统计
exports.getCategoryStats = (req, res) => {
  try {
    const categories = coupletDB.getCategories();
    
    // 计算总对联数
    const totalCouplets = categories.reduce((sum, cat) => sum + cat.count, 0);
    
    // 按数量排序
    const sortedCategories = [...categories].sort((a, b) => b.count - a.count);
    
    // 最受欢迎的分类（前5个）
    const popularCategories = sortedCategories.slice(0, 5);
    
    res.status(200).json({
      success: true,
      data: {
        total_categories: categories.length,
        total_couplets: totalCouplets,
        average_couplets_per_category: Math.round(totalCouplets / categories.length),
        popular_categories: popularCategories,
        distribution: categories.map(cat => ({
          name: cat.name,
          count: cat.count,
          percentage: Math.round((cat.count / totalCouplets) * 100)
        }))
      }
    });
  } catch (error) {
    console.error('获取分类统计错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取分类对联数量分布
exports.getCategoryDistribution = (req, res) => {
  try {
    const categories = coupletDB.getCategories();
    const totalCouplets = categories.reduce((sum, cat) => sum + cat.count, 0);
    
    const distribution = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      count: cat.count,
      percentage: Math.round((cat.count / totalCouplets) * 100),
      color: this.getCategoryColor(cat.id)
    }));
    
    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('获取分类分布错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 辅助函数：根据分类ID生成颜色
exports.getCategoryColor = (categoryId) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2',
    '#EF476F', '#7B68EE', '#20B2AA', '#FFA500', '#9B59B6'
  ];
  
  // 使用简单的哈希函数生成颜色索引
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};