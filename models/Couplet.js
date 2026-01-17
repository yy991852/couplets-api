// 对联数据模型 - 纯内存版本
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
    this.created_at = data.created_at || new Date().toISOString();
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

// 模拟数据库 - 内置数据
class CoupletDatabase {
  constructor() {
    this.couplets = new Map();
    this.initializeMockData();
  }

  // 初始化内置数据
  initializeMockData() {
    // 内置测试数据，不需要外部JSON文件
    const mockData = [
      {
        id: 1,
        title: '新春祝福对联',
        upper_line: '福如东海长流水',
        lower_line: '寿比南山不老松',
        category: '春节',
        description: '传统新春祝福对联，寓意长寿富贵',
        author: '佚名',
        origin: '中国传统',
        meaning: '祝福长寿如东海，健康如南山不老松',
        usage: '春节门联、祝福语',
        tags: ['春节', '祝福', '长寿', '传统'],
        recommended: true,
        views: 0,
        favorites: 0
      },
      {
        id: 2,
        title: '生意兴隆对联',
        upper_line: '生意兴隆通四海',
        lower_line: '财源茂盛达三江',
        category: '商业',
        description: '商业祝福对联，寓意生意兴旺',
        author: '佚名',
        origin: '商业传统',
        meaning: '祝愿生意遍布四海，财源广达三江',
        usage: '商铺开业、商业祝福',
        tags: ['商业', '财运', '生意', '开业'],
        recommended: true,
        views: 0,
        favorites: 0
      },
      {
        id: 3,
        title: '家庭和睦对联',
        upper_line: '家和万事兴',
        lower_line: '人勤百业旺',
        category: '家庭',
        description: '家庭和睦对联，强调家庭和谐重要性',
        author: '佚名',
        origin: '民间谚语',
        meaning: '家庭和睦是万事兴旺的基础，勤劳才能事业兴盛',
        usage: '家庭门联、客厅装饰',
        tags: ['家庭', '和睦', '勤劳', '兴旺'],
        recommended: false,
        views: 0,
        favorites: 0
      },
      {
        id: 4,
        title: '学业有成对联',
        upper_line: '书山有路勤为径',
        lower_line: '学海无涯苦作舟',
        category: '教育',
        description: '劝学对联，鼓励勤奋学习',
        author: '韩愈',
        origin: '唐代文学',
        meaning: '学习需要勤奋和刻苦',
        usage: '书房、学校、教育机构',
        tags: ['学习', '教育', '勤奋', '文学'],
        recommended: true,
        views: 0,
        favorites: 0
      },
      {
        id: 5,
        title: '喜庆婚礼对联',
        upper_line: '喜结良缘天地久',
        lower_line: '永浴爱河日月长',
        category: '婚礼',
        description: '婚礼喜庆对联',
        author: '佚名',
        origin: '传统婚礼',
        meaning: '祝福婚姻长久，爱情永恒',
        usage: '婚礼现场、新房',
        tags: ['婚礼', '爱情', '喜庆', '婚姻'],
        recommended: true,
        views: 0,
        favorites: 0
      }
    ];

    mockData.forEach(coupletData => {
      const couplet = new Couplet(coupletData.id, coupletData);
      this.couplets.set(coupletData.id, couplet);
    });
    
    console.log(`✅ 初始化了 ${this.couplets.size} 条对联数据`);
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
    const shuffled = [...allCouplets].sort(() => 0.5 - Math.random());
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

  // 添加新对联
  addCouplet(data) {
    const id = Math.max(...Array.from(this.couplets.keys())) + 1;
    const couplet = new Couplet(id, {
      ...data,
      created_at: new Date().toISOString(),
      views: 0,
      favorites: 0
    });
    this.couplets.set(id, couplet);
    return couplet.toJSON();
  }

  // 获取统计数据
  getStats() {
    const allCouplets = Array.from(this.couplets.values());
    return {
      total: allCouplets.length,
      totalViews: allCouplets.reduce((sum, c) => sum + c.views, 0),
      totalFavorites: allCouplets.reduce((sum, c) => sum + c.favorites, 0),
      categories: this.getCategories(),
      topViewed: allCouplets
        .sort((a, b) => b.views - a.views)
        .slice(0, 5)
        .map(c => ({ id: c.id, title: c.title, views: c.views })),
      topFavorites: allCouplets
        .sort((a, b) => b.favorites - a.favorites)
        .slice(0, 5)
        .map(c => ({ id: c.id, title: c.title, favorites: c.favorites }))
    };
  }
}

// 创建单例实例
const coupletDB = new CoupletDatabase();

module.exports = {
  Couplet,
  CoupletDatabase,
  coupletDB
};