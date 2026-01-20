const mongoose = require('mongoose');

// 1. 定义Schema（完全匹配你的单文档嵌套结构）
const coupletSchema = new mongoose.Schema({
  // 分类数组（和数据库一致）
  categories: [{
    id: Number,
    name: String,
    description: String,
    count: Number
  }],
  // 对联数组（和数据库一致）
  couplets: [{
    id: Number,
    category_id: Number,
    first_line: String,
    second_line: String,
    horizontal: String,
    author: String,
    dynasty: String,
    description: String,
    popularity: Number,
    favorite_count: Number,
    tags: [String],
    recommended: Boolean,
    created_at: Date
  }],
  authors: [{ id: Number, name: String, dynasty: String, count: Number }],
  tags: [{ id: Number, name: String, count: Number }],
  metadata: {
    total_couplets: Number,
    total_categories: Number,
    last_updated: Date
  }
});

// 2. 静态方法：获取分类列表（直接读取数据库的categories数组）
coupletSchema.statics.getCategories = async function() {
  try {
    // 查询集合中唯一的文档
    const doc = await this.findOne({}).lean();
    // 无数据返回空数组
    if (!doc || !Array.isArray(doc.categories)) return [];
    // 返回完整分类列表
    return doc.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      count: cat.count || 0
    }));
  } catch (error) {
    console.error('获取分类列表失败:', error);
    return [];
  }
};

// 3. 静态方法：获取所有对联（带分类/推荐筛选+分页）
coupletSchema.statics.getAllCouplets = async function(options = {}) {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category: categoryId, // 分类ID
      recommended 
    } = options;

    // 参数验证
    const validPage = Math.max(1, parseInt(page));
    const validLimit = Math.max(1, Math.min(50, parseInt(limit)));
    const targetCategoryId = categoryId ? parseInt(categoryId) : undefined;
    const isRecommended = recommended === 'true' ? true : (recommended === 'false' ? false : undefined);

    // 查询唯一文档
    const doc = await this.findOne({}).lean();
    let coupletsList = doc?.couplets || [];

    // 1. 按分类筛选
    if (targetCategoryId) {
      coupletsList = coupletsList.filter(item => 
        parseInt(item.category_id) === targetCategoryId
      );
    }

    // 2. 按推荐筛选
    if (isRecommended !== undefined) {
      coupletsList = coupletsList.filter(item => item.recommended === isRecommended);
    }

    // 3. 分页处理
    const total = coupletsList.length;
    const start = (validPage - 1) * validLimit;
    const end = start + validLimit;
    const paginatedData = coupletsList.slice(start, end);

    return {
      data: paginatedData,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
        hasNextPage: end < total,
        hasPrevPage: validPage > 1
      }
    };
  } catch (error) {
    console.error('获取对联列表失败:', error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
};

// 4. 静态方法：获取单条对联详情
coupletSchema.statics.getCoupletById = async function(id) {
  try {
    const targetId = parseInt(id);
    if (isNaN(targetId)) return null;

    // 查询文档并找到对应ID的对联
    const doc = await this.findOne({}).lean();
    const couplet = doc?.couplets?.find(item => parseInt(item.id) === targetId);
    
    if (!couplet) return null;

    // 更新浏览热度（同步到数据库）
    await this.updateOne(
      { "couplets.id": targetId },
      { $inc: { "couplets.$.popularity": 1 } }
    );

    // 返回更新后的对联数据
    return {
      ...couplet,
      popularity: (couplet.popularity || 0) + 1 // 前端展示最新热度
    };
  } catch (error) {
    console.error('获取对联详情失败:', error);
    return null;
  }
};

// 5. 静态方法：获取随机对联
coupletSchema.statics.getRandomCouplets = async function(limit = 3) {
  try {
    const doc = await this.findOne({}).lean();
    const coupletsList = doc?.couplets || [];
    
    // 随机洗牌算法
    const shuffled = [...coupletsList].sort(() => Math.random() - 0.5);
    // 返回指定数量的随机对联
    return shuffled.slice(0, Math.max(1, Math.min(10, parseInt(limit))));
  } catch (error) {
    console.error('获取随机对联失败:', error);
    return [];
  }
};

// 6. 静态方法：更新收藏数
coupletSchema.statics.updateFavoriteCount = async function(id, increment = true) {
  try {
    const targetId = parseInt(id);
    if (isNaN(targetId)) return null;

    // 更新嵌套数组中的收藏数
    const update = increment 
      ? { $inc: { "couplets.$.favorite_count": 1 } } 
      : { $inc: { "couplets.$.favorite_count": -1 } };

    const result = await this.updateOne(
      { "couplets.id": targetId },
      update
    );

    if (result.modifiedCount === 0) return null;

    // 查询更新后的收藏数
    const doc = await this.findOne(
      { "couplets.id": targetId },
      { "couplets.$.favorite_count": 1 }
    ).lean();

    return doc.couplets[0].favorite_count;
  } catch (error) {
    console.error('更新收藏数失败:', error);
    return null;
  }
};

// 7. 静态方法：搜索对联（模糊匹配）
coupletSchema.statics.searchCouplets = async function(query = '', options = {}) {
  try {
    const { page = 1, limit = 10 } = options;
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getAllCouplets(options);

    const doc = await this.findOne({}).lean();
    let coupletsList = doc?.couplets || [];

    // 模糊搜索：上联/下联/横批/标签/作者
    const filtered = coupletsList.filter(item => 
      (item.first_line?.toLowerCase().includes(searchTerm) ||
       item.second_line?.toLowerCase().includes(searchTerm) ||
       item.horizontal?.toLowerCase().includes(searchTerm) ||
       item.author?.toLowerCase().includes(searchTerm) ||
       item.tags?.some(tag => tag.toLowerCase().includes(searchTerm)))
    );

    // 分页
    const total = filtered.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginatedData = filtered.slice(start, start + parseInt(limit));

    return {
      data: paginatedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    console.error('搜索对联失败:', error);
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
};

// 8. 创建Model（指定你的集合名：coupletsCt）
const CoupletModel = mongoose.model('Couplet', coupletSchema, 'coupletsCt');

// 9. 导出Model
module.exports = CoupletModel;