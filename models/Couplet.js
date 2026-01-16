// 对联数据模型
class Couplet {
  constructor(id, data) {
    this.id = id;
    this.title = data.title || '';
    this.upper_line = data.upper_line || '';
    this.lower_line = data.lower_line || '';
    this.category = data.category || '';
    this.description = data.description || '';
    this.author = data.author || '';
    this.origin = data.origin || '';
    this.meaning = data.meaning || '';
    this.usage = data.usage || '';
    this.tags = data.tags || [];
    this.recommended = data.recommended || false;
    this.created_at = data.created_at || new Date().toISOString().split('T')[0];
    this.views = data.views || 0;
    this.favorites = data.favorites || 0;
  }

  // 转换为JSON格式
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      upper_line: this.upper_line,
      lower_line: this.lower_line,
      category: this.category,
      description: this.description,
      author: this.author,
      origin: this.origin,
      meaning: this.meaning,
      usage: this.usage,
      tags: this.tags,
      recommended: this.recommended,
      created_at: this.created_at,
      views: this.views,
      favorites: this.favorites
    };
  }

  // 增加浏览量
  incrementViews() {
    this.views += 1;
    return this;
  }

  // 增加收藏数
  incrementFavorites() {
    this.favorites += 1;
    return this;
  }

  // 减少收藏数
  decrementFavorites() {
    this.favorites = Math.max(0, this.favorites - 1);
    return this;
  }
}

// 模拟数据库
class CoupletDatabase {
  constructor() {
    this.couplets = new Map();
    this.initializeMockData();
  }

  // 初始化模拟数据
  initializeMockData() {
    const mockData = require('../../../database/couplets_data.json');
    
    mockData.couplets.forEach(coupletData => {
      const couplet = new Couplet(coupletData.id, coupletData);
      this.couplets.set(coupletData.id, couplet);
    });
  }

  // 获取所有对联
  getAllCouplets(options = {}) {
    let results = Array.from(this.couplets.values());
    
    // 过滤推荐
    if (options.recommended !== undefined) {
      results = results.filter(c => c.recommended === options.recommended);
    }
    
    // 按分类过滤
    if (options.category) {
      results = results.filter(c => c.category === options.category);
    }
    
    // 分页
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedResults = results.slice(startIndex, endIndex);
    
    return {
      data: paginatedResults.map(c => c.toJSON()),
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit)
      }
    };
  }

  // 获取单个对联
  getCoupletById(id) {
    const couplet = this.couplets.get(parseInt(id));
    if (couplet) {
      couplet.incrementViews();
      return couplet.toJSON();
    }
    return null;
  }

  // 搜索对联
  searchCouplets(query, options = {}) {
    let results = Array.from(this.couplets.values());
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(couplet => {
        return (
          couplet.title.toLowerCase().includes(searchTerm) ||
          couplet.upper_line.toLowerCase().includes(searchTerm) ||
          couplet.lower_line.toLowerCase().includes(searchTerm) ||
          couplet.description.toLowerCase().includes(searchTerm) ||
          couplet.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          couplet.category.toLowerCase().includes(searchTerm)
        );
      });
    }
    
    // 分页
    const page = options.page || 1;
    const limit = options.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedResults = results.slice(startIndex, endIndex);
    
    return {
      data: paginatedResults.map(c => c.toJSON()),
      pagination: {
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit)
      }
    };
  }

  // 获取分类列表
  getCategories() {
    const categories = new Map();
    
    this.couplets.forEach(couplet => {
      const category = couplet.category;
      if (!categories.has(category)) {
        categories.set(category, {
          name: category,
          count: 0
        });
      }
      categories.get(category).count += 1;
    });
    
    return Array.from(categories.values()).map(cat => ({
      id: cat.name.toLowerCase().replace(/\s+/g, '-'),
      name: cat.name,
      count: cat.count
    }));
  }

  // 获取随机对联
  getRandomCouplets(limit = 3) {
    const allCouplets = Array.from(this.couplets.values());
    const shuffled = allCouplets.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit).map(c => c.toJSON());
  }

  // 更新收藏数
  updateFavoriteCount(id, increment = true) {
    const couplet = this.couplets.get(parseInt(id));
    if (couplet) {
      if (increment) {
        couplet.incrementFavorites();
      } else {
        couplet.decrementFavorites();
      }
      return couplet.favorites;
    }
    return null;
  }
}

// 创建单例实例
const coupletDB = new CoupletDatabase();

module.exports = {
  Couplet,
  CoupletDatabase,
  coupletDB
};