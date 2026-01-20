// api/categories.js
const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');

// ✅ 确保方法名和控制器导出一致
router.get('/', categoriesController.getAllCategories); // 获取所有分类
router.get('/:id', categoriesController.getCategoryById); // 获取分类详情
router.get('/stats', categoriesController.getCategoryStats); // 获取分类统计
router.get('/distribution', categoriesController.getCategoryDistribution); // 获取分类分布

module.exports = router;