// models/Couplet.js - 修改为内置数据版本
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

  incrementViews() {
    this.views += 1;
    return this;
  }

  incrementFavorites() {
    this.favorites += 1;
    return this;
  }

  decrementFavorites() {
    this.favorites = Math.max(0, this.favorites - 1);
    return this;
  }
}

// 模拟数据库 - 使用内置数据
class CoupletDatabase {
  constructor() {
    this.couplets = new Map();
    this.initializeBuiltInData(); // 改为内置数据
  }

  // 初始化内置数据（不再依赖JSON文件）
  initializeBuiltInData() {
    const builtInData = {
      couplets: [
        {
          id: 1,
          title: '新春祝福对联',
          upper_line: '福如东海长流水',
          lower_line: '寿比南山不老松',
          category: '春节',
          description: '传统新春祝福对联',
          author: '佚名',
          origin: '中国传统',
          meaning: '祝福长寿富贵',
          usage: '春节门联',
          tags: ['春节', '祝福', '长寿'],
          recommended: true,
          views: 150,
          favorites: 45
        },
        {
          id: 2,
          title: '生意兴隆对联',
          upper_line: '生意兴隆通四海',
          lower_line: '财源茂盛达三江',
          category: '商业',
          description: '商业祝福对联',
          author: '佚名',
          origin: '商业传统',
          meaning: '祝愿生意兴旺',
          usage: '商铺开业',
          tags: ['商业', '财运', '生意'],
          recommended: true,
          views: 120,
          favorites: 38
        },
        {
          id: 3,
          title: '家庭和睦对联',
          upper_line: '家和万事兴',
          lower_line: '人勤百业旺',
          category: '家庭',
          description: '家庭和睦对联',
          author: '佚名',
          origin: '民间谚语',
          meaning: '家庭和睦的重要性',
          usage: '家庭门联',
          tags: ['家庭', '和睦', '勤劳'],
          recommended: true,
          views: 95,
          favorites: 32
        },
        {
          id: 4,
          title: '学业有成对联',
          upper_line: '书山有路勤为径',
          lower_line: '学海无涯苦作舟',
          category: '教育',
          description: '劝学对联',
          author: '韩愈',
          origin: '唐代文学',
          meaning: '学习需要勤奋',
          usage: '书房对联',
          tags: ['学习', '教育', '勤奋'],
          recommended: true,
          views: 110,
          favorites: 40
        },
        {
          id: 5,
          title: '健康长寿对联',
          upper_line: '健康如意春',
          lower_line: '平安吉祥年',
          category: '健康',
          description: '健康祝福对联',
          author: '佚名',
          origin: '民间祝福',
          meaning: '祝愿健康平安',
          usage: '健康祝福',
          tags: ['健康', '平安', '祝福'],
          recommended: false,
          views: 80,
          favorites: 25
        }
      ]
    };

    builtInData.couplets.forEach(coupletData => {
      const couplet = new Couplet(coupletData.id, coupletData);
      this.couplets.set(coupletData.id, couplet);
    });
    
    console.log(`✅ 使用内置数据，初始化了 ${this.couplets.size} 条对联`);
  }

  // 获取所有对联
  getAllCouplets(options = {}) {
    let results = Array.from(this.couplets.values());
    
    if (options.recommended !== undefined) {
      results = results.filter(c => c.recommended === options.recommended);
    }
    
    if (options.category) {
      results = results.filter(c => c.category === options.category);
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