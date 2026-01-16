const { coupletDB } = require('../models/Couplet');

// 搜索对联
exports.searchCouplets = (req, res) => {
  try {
    const { 
      q = '', 
      page = 1, 
      limit = 10,
      category,
      sort = 'relevance'
    } = req.query;
    
    // 验证搜索关键词
    const searchQuery = q.trim();
    if (!searchQuery && !category) {
      return res.status(400).json({
        success: false,
        error: '请输入搜索关键词或选择分类'
      });
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      category: category || undefined
    };
    
    // 执行搜索
    const result = coupletDB.searchCouplets(searchQuery, options);
    
    // 如果指定了排序
    if (sort === 'views') {
      result.data.sort((a, b) => b.views - a.views);
    } else if (sort === 'favorites') {
      result.data.sort((a, b) => b.favorites - a.favorites);
    } else if (sort === 'date') {
      result.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      search: {
        query: searchQuery,
        category: category,
        sort: sort
      }
    });
  } catch (error) {
    console.error('搜索对联错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取热门搜索关键词
exports.getHotKeywords = (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // 模拟热门关键词
    const hotKeywords = [
      '春节', '祝福', '商业', '教育', '家庭', 
      '励志', '婚庆', '风景', '健康', '生意'
    ].slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: hotKeywords
    });
  } catch (error) {
    console.error('获取热门关键词错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取搜索建议
exports.getSearchSuggestions = (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    const query = q.toLowerCase().trim();
    
    // 从数据库中获取所有对联数据
    const allCouplets = coupletDB.getAllCouplets({ limit: 1000 });
    
    // 收集所有可能的建议
    const suggestions = new Set();
    
    allCouplets.data.forEach(couplet => {
      // 检查标题
      if (couplet.title.toLowerCase().includes(query)) {
        suggestions.add(couplet.title);
      }
      
      // 检查分类
      if (couplet.category.toLowerCase().includes(query)) {
        suggestions.add(couplet.category);
      }
      
      // 检查标签
      couplet.tags.forEach(tag => {
        if (tag.toLowerCase().includes(query)) {
          suggestions.add(tag);
        }
      });
      
      // 检查对联内容
      if (couplet.upper_line.toLowerCase().includes(query) || 
          couplet.lower_line.toLowerCase().includes(query)) {
        suggestions.add(couplet.upper_line);
      }
    });
    
    // 转换为数组并限制数量
    const suggestionArray = Array.from(suggestions).slice(0, 10);
    
    res.status(200).json({
      success: true,
      data: suggestionArray
    });
  } catch (error) {
    console.error('获取搜索建议错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};

// 获取搜索统计
exports.getSearchStats = (req, res) => {
  try {
    const totalCouplets = coupletDB.getAllCouplets({ limit: 1000 }).data.length;
    const categories = coupletDB.getCategories();
    
    res.status(200).json({
      success: true,
      data: {
        total_couplets: totalCouplets,
        total_categories: categories.length,
        categories: categories,
        last_updated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('获取搜索统计错误:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    });
  }
};