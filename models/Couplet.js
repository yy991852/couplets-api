// models/Couplet.js - 适配数据库实际字段
class Couplet {
  constructor(id, data) {
    // 对应数据库字段：id、category_id、first_line、second_line、horizontal等
    this.id = id;
    this.category_id = data.category_id || 1; // 数据库有category_id字段
    this.first_line = data.first_line || '';  // 数据库是first_line（对应原upper_line）
    this.second_line = data.second_line || '';// 数据库是second_line（对应原lower_line）
    this.horizontal = data.horizontal || '';  // 数据库是horizontal（对应原title）
    this.author = data.author || '';
    this.dynasty = data.dynasty || '';        // 新增数据库的dynasty字段
    this.description = data.description || '';
    this.popularity = data.popularity || 0;    // 新增数据库的popularity字段
    this.favorite_count = data.favorite_count || 0; // 数据库是favorite_count（对应原favorites）
    this.tags = data.tags || [];
    this.recommended = data.recommended || false;
    this.created_at = data.created_at || new Date().toISOString().split('T')[0];
  }

  // 输出和数据库一致的字段格式
  toJSON() {
    return {
      id: this.id,
      category_id: this.category_id,
      first_line: this.first_line,
      second_line: this.second_line,
      horizontal: this.horizontal,
      author: this.author,
      dynasty: this.dynasty,
      description: this.description,
      popularity: this.popularity,
      favorite_count: this.favorite_count,
      tags: this.tags,
      recommended: this.recommended,
      created_at: this.created_at
    };
  }

  // 适配数据库的favorite_count字段
  incrementFavorites() {
    this.favorite_count += 1;
    return this;
  }

  decrementFavorites() {
    this.favorite_count = Math.max(0, this.favorite_count - 1);
    return this;
  }
}

// 模拟数据库 - 若后续连接MongoDB，这里可替换为Mongoose模型逻辑
class CoupletDatabase {
  constructor() {
    this.couplets = new Map();
    this.initializeBuiltInData(); // 初始化数据（后续可改为从MongoDB读取）
  }

  // 初始化内置数据（和数据库字段一致）
  initializeBuiltInData() {
    console.log("🔴 开始初始化内置数据..."); // 新增日志
    const builtInData = {
      couplets: [
        {
          id: 1,
          category_id: 1,
          first_line: "天增岁月人增寿",
          second_line: "春满乾坤福满门",
          horizontal: "四季平安",
          author: "民间传统",
          dynasty: "明代",
          description: "经典春节祝福对联，上联以“天增岁月”呼应时光流转，下联以“春满乾坤”烘托新春气象...",
          popularity: 98,
          favorite_count: 1250,
          tags: ["春节", "祝福", "传统"],
          recommended: true,
          created_at: "2026-01-01"
        },
        // 可继续添加其他数据（字段和数据库一致）
      ]
    };

    builtInData.couplets.forEach(coupletData => {
      const couplet = new Couplet(coupletData.id, coupletData);
      this.couplets.set(coupletData.id, couplet);
    });
    
    console.log(`✅ 使用内置数据，初始化了 ${this.couplets.size} 条对联`);
  }

  // 获取所有对联（逻辑不变，仅字段适配）
  getAllCouplets(options = {}) {
    let results = Array.from(this.couplets.values());
    
    if (options.recommended !== undefined) {
      results = results.filter(c => c.recommended === options.recommended);
    }
    
    if (options.category) {
      results = results.filter(c => c.category_id === parseInt(options.category));
    }
    
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

  // 获取单个对联（逻辑不变，字段适配）
  getCoupletById(id) {
    const couplet = this.couplets.get(parseInt(id));
    return couplet ? couplet.toJSON() : null;
  }

  // 搜索对联（适配新字段）
  searchCouplets(query, options = {}) {
    let results = Array.from(this.couplets.values());
    
    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(couplet => {
        return (
          couplet.first_line.toLowerCase().includes(searchTerm) ||
          couplet.second_line.toLowerCase().includes(searchTerm) ||
          couplet.horizontal.toLowerCase().includes(searchTerm) ||
          couplet.description.toLowerCase().includes(searchTerm) ||
          couplet.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      });
    }
    
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

  // 获取分类列表（适配category_id）
  getCategories() {
    const categories = new Map();
    
    this.couplets.forEach(couplet => {
      const categoryId = couplet.category_id;
      const categoryName = this.getCategoryName(categoryId); // 可根据category_id映射名称
      if (!categories.has(categoryId)) {
        categories.set(categoryId, {
          id: categoryId,
          name: categoryName,
          count: 0
        });
      }
      categories.get(categoryId).count += 1;
    });
    
    return Array.from(categories.values());
  }

  // 辅助方法：根据category_id获取分类名称
  getCategoryName(categoryId) {
    const categoryMap = {
      1: "春节",
      2: "商业",
      3: "家庭"
    };
    return categoryMap[categoryId] || `分类${categoryId}`;
  }

  // 获取随机对联（逻辑不变）
  getRandomCouplets(limit = 3) {
    const allCouplets = Array.from(this.couplets.values());
    const shuffled = allCouplets.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit).map(c => c.toJSON());
  }

  // 更新收藏数（适配favorite_count）
  updateFavoriteCount(id, increment = true) {
    const couplet = this.couplets.get(parseInt(id));
    if (couplet) {
      increment ? couplet.incrementFavorites() : couplet.decrementFavorites();
      return couplet.favorite_count;
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