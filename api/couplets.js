// api/couplets.js
const express = require('express');
const router = express.Router();
const coupletsController = require('../controllers/coupletsController');

// ✅ 关键：静态路由（/random、/search）必须放在动态路由（/:id）前面
// 1. 获取所有对联（带筛选）
router.get('/', coupletsController.getAllCouplets);
// 2. 获取随机对联（优先匹配）
router.get('/random', coupletsController.getRandomCouplets);
// 3. 搜索对联（优先匹配）
router.get('/search', coupletsController.searchCouplets);
// 4. 更新收藏数
router.patch('/:id/favorites', coupletsController.updateCoupletFavorite);
// 5. 获取单条对联详情（动态路由放最后）
router.get('/:id', coupletsController.getCoupletDetail);

module.exports = router;