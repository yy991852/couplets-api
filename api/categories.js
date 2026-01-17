const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

// 验证分类ID中间件
const validateCategoryId = (req, res, next) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: '无效的分类ID'
    });
  }
  next();
};

/**
 * @route GET /api/categories
 * @desc 获取所有分类列表
 * @access Public
 */
router.get('/', categoriesController.getAllCategories);

/**
 * @route GET /api/categories/:id
 * @desc 获取单个分类详情
 * @access Public
 * @param {string} id - 分类ID
 */
router.get('/:id', validateCategoryId, categoriesController.getCategoryById);

/**
 * @route GET /api/categories/stats
 * @desc 获取分类统计信息
 * @access Public
 */
router.get('/stats', categoriesController.getCategoryStats);

/**
 * @route GET /api/categories/distribution
 * @desc 获取分类对联数量分布
 * @access Public
 */
router.get('/distribution', categoriesController.getCategoryDistribution);

// API文档端点
router.get('/docs', (req, res) => {
  res.status(200).json({
    endpoints: [
      {
        method: 'GET',
        path: '/api/categories',
        description: '获取所有分类列表',
        parameters: []
      },
      {
        method: 'GET',
        path: '/api/categories/:id',
        description: '获取单个分类详情',
        parameters: [
          { name: 'id', type: 'string', description: '分类ID', required: true }
        ]
      },
      {
        method: 'GET',
        path: '/api/categories/stats',
        description: '获取分类统计信息',
        parameters: []
      },
      {
        method: 'GET',
        path: '/api/categories/distribution',
        description: '获取分类对联数量分布',
        parameters: []
      }
    ],
    category_ids: [
      '春节',
      '商业', 
      '教育',
      '家庭',
      '祝寿',
      '婚庆',
      '励志',
      '风景'
    ],
    examples: [
      {
        description: '获取所有分类',
        url: '/api/categories'
      },
      {
        description: '获取春节分类详情',
        url: '/api/categories/春节'
      },
      {
        description: '获取分类统计',
        url: '/api/categories/stats'
      }
    ]
  });
});

module.exports = router;