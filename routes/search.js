const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// 验证查询参数中间件
const validateSearchParams = (req, res, next) => {
  const { page, limit, q } = req.query;
  
  // 验证页码
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: '页码必须是大于0的整数'
    });
  }
  
  // 验证每页数量
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: '每页数量必须是1-100之间的整数'
    });
  }
  
  // 验证搜索关键词长度
  if (q && q.trim().length > 100) {
    return res.status(400).json({
      success: false,
      error: '搜索关键词长度不能超过100个字符'
    });
  }
  
  next();
};

/**
 * @route GET /api/search
 * @desc 搜索对联
 * @access Public
 * @query {string} [q] - 搜索关键词
 * @query {number} [page=1] - 页码
 * @query {number} [limit=10] - 每页数量
 * @query {string} [category] - 按分类筛选
 * @query {string} [sort=relevance] - 排序方式 (relevance/views/favorites/date)
 */
router.get('/', validateSearchParams, searchController.searchCouplets);

/**
 * @route GET /api/search/hot
 * @desc 获取热门搜索关键词
 * @access Public
 * @query {number} [limit=10] - 返回数量
 */
router.get('/hot', searchController.getHotKeywords);

/**
 * @route GET /api/search/suggestions
 * @desc 获取搜索建议
 * @access Public
 * @query {string} q - 搜索关键词
 */
router.get('/suggestions', searchController.getSearchSuggestions);

/**
 * @route GET /api/search/stats
 * @desc 获取搜索统计信息
 * @access Public
 */
router.get('/stats', searchController.getSearchStats);

// API文档端点
router.get('/docs', (req, res) => {
  res.status(200).json({
    endpoints: [
      {
        method: 'GET',
        path: '/api/search',
        description: '搜索对联',
        parameters: [
          { name: 'q', type: 'string', description: '搜索关键词' },
          { name: 'page', type: 'number', description: '页码 (默认: 1)' },
          { name: 'limit', type: 'number', description: '每页数量 (默认: 10, 最大: 100)' },
          { name: 'category', type: 'string', description: '按分类筛选' },
          { name: 'sort', type: 'string', description: '排序方式', enum: ['relevance', 'views', 'favorites', 'date'], default: 'relevance' }
        ]
      },
      {
        method: 'GET',
        path: '/api/search/hot',
        description: '获取热门搜索关键词',
        parameters: [
          { name: 'limit', type: 'number', description: '返回数量 (默认: 10)' }
        ]
      },
      {
        method: 'GET',
        path: '/api/search/suggestions',
        description: '获取搜索建议',
        parameters: [
          { name: 'q', type: 'string', description: '搜索关键词', required: true }
        ]
      },
      {
        method: 'GET',
        path: '/api/search/stats',
        description: '获取搜索统计信息',
        parameters: []
      }
    ],
    examples: [
      {
        description: '搜索春节相关的对联',
        url: '/api/search?q=春节&page=1&limit=10'
      },
      {
        description: '按浏览量排序搜索',
        url: '/api/search?q=祝福&sort=views'
      },
      {
        description: '获取搜索建议',
        url: '/api/search/suggestions?q=春'
      }
    ]
  });
});

module.exports = router;