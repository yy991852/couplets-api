const express = require('express');
const router = express.Router();
const coupletsController = require('../controllers/coupletsController');

// 验证中间件
const validateCoupletId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      error: '无效的对联ID'
    });
  }
  next();
};

// 验证查询参数中间件
const validateQueryParams = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({
      success: false,
      error: '页码必须是大于0的整数'
    });
  }
  
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      success: false,
      error: '每页数量必须是1-100之间的整数'
    });
  }
  
  next();
};

/**
 * @route GET /api/couplets
 * @desc 获取所有对联列表
 * @access Public
 * @query {number} [page=1] - 页码
 * @query {number} [limit=10] - 每页数量
 * @query {boolean} [recommended] - 是否只获取推荐对联
 * @query {string} [category] - 按分类筛选
 */
router.get('/', validateQueryParams, coupletsController.getAllCouplets);

/**
 * @route GET /api/couplets/recommended
 * @desc 获取推荐对联
 * @access Public
 * @query {number} [limit=5] - 返回数量
 */
router.get('/recommended', coupletsController.getRecommendedCouplets);

/**
 * @route GET /api/couplets/random
 * @desc 获取随机对联
 * @access Public
 * @query {number} [limit=3] - 返回数量
 */
router.get('/random', coupletsController.getRandomCouplets);

/**
 * @route GET /api/couplets/:id
 * @desc 获取单个对联详情
 * @access Public
 * @param {string} id - 对联ID
 */
router.get('/:id', validateCoupletId, coupletsController.getCoupletById);

/**
 * @route GET /api/couplets/:id/related
 * @desc 获取相关对联
 * @access Public
 * @param {string} id - 对联ID
 * @query {number} [limit=3] - 返回数量
 */
router.get('/:id/related', validateCoupletId, coupletsController.getRelatedCouplets);

/**
 * @route POST /api/couplets/:id/favorite
 * @desc 更新对联收藏数
 * @access Public
 * @param {string} id - 对联ID
 * @body {string} [action=increment] - 操作类型 (increment/decrement)
 */
router.post('/:id/favorite', validateCoupletId, coupletsController.updateFavoriteCount);

// API文档端点
router.get('/docs', (req, res) => {
  res.status(200).json({
    endpoints: [
      {
        method: 'GET',
        path: '/api/couplets',
        description: '获取所有对联列表',
        parameters: [
          { name: 'page', type: 'number', description: '页码 (默认: 1)' },
          { name: 'limit', type: 'number', description: '每页数量 (默认: 10, 最大: 100)' },
          { name: 'recommended', type: 'boolean', description: '是否只获取推荐对联' },
          { name: 'category', type: 'string', description: '按分类筛选' }
        ]
      },
      {
        method: 'GET',
        path: '/api/couplets/:id',
        description: '获取单个对联详情',
        parameters: [
          { name: 'id', type: 'string', description: '对联ID', required: true }
        ]
      },
      {
        method: 'GET',
        path: '/api/couplets/recommended',
        description: '获取推荐对联',
        parameters: [
          { name: 'limit', type: 'number', description: '返回数量 (默认: 5)' }
        ]
      },
      {
        method: 'GET',
        path: '/api/couplets/random',
        description: '获取随机对联',
        parameters: [
          { name: 'limit', type: 'number', description: '返回数量 (默认: 3)' }
        ]
      },
      {
        method: 'POST',
        path: '/api/couplets/:id/favorite',
        description: '更新对联收藏数',
        parameters: [
          { name: 'id', type: 'string', description: '对联ID', required: true },
          { name: 'action', type: 'string', description: '操作类型 (increment/decrement)', enum: ['increment', 'decrement'] }
        ]
      }
    ]
  });
});

module.exports = router;