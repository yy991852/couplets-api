// models/CoupletModel.js
const mongoose = require('mongoose');

const CoupletSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  upper_line: {
    type: String,
    required: true,
    trim: true
  },
  lower_line: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  author: {
    type: String,
    trim: true,
    default: '佚名'
  },
  origin: {
    type: String,
    trim: true,
    default: ''
  },
  meaning: {
    type: String,
    trim: true,
    default: ''
  },
  usage: {
    type: String,
    trim: true,
    default: ''
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  recommended: {
    type: Boolean,
    default: false,
    index: true
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  favorites: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// 创建文本索引用于搜索
CoupletSchema.index(
  { 
    title: 'text', 
    upper_line: 'text', 
    lower_line: 'text', 
    description: 'text', 
    tags: 'text' 
  },
  {
    weights: {
      title: 5,
      upper_line: 4,
      lower_line: 4,
      description: 2,
      tags: 3
    }
  }
);

// 静态方法
CoupletSchema.statics.getAllCouplets = async function(options = {}) {
  const {
    page = 1,
    limit = 10,
    category,
    recommended,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = {};
  if (category) query.category = category;
  if (recommended !== undefined) query.recommended = recommended;

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;
  
  const [couplets, total] = await Promise.all([
    this.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    data: couplets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
};

CoupletSchema.statics.getCoupletById = async function(id) {
  const couplet = await this.findById(id).lean();
  if (couplet) {
    await this.findByIdAndUpdate(id, { $inc: { views: 1 } });
  }
  return couplet;
};

CoupletSchema.statics.searchCouplets = async function(query, options = {}) {
  const {
    page = 1,
    limit = 10
  } = options;

  const searchQuery = query ? { $text: { $search: query } } : {};
  
  const skip = (page - 1) * limit;
  
  const [couplets, total] = await Promise.all([
    this.find(searchQuery)
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(searchQuery)
  ]);

  return {
    data: couplets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

CoupletSchema.statics.getCategories = async function() {
  const categories = await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        id: { $toLower: { $replaceAll: { input: '$_id', find: ' ', replacement: '-' } } },
        name: '$_id',
        count: 1
      }
    },
    { $sort: { count: -1 } }
  ]);

  return categories;
};

CoupletSchema.statics.getRandomCouplets = async function(limit = 3) {
  return await this.aggregate([
    { $sample: { size: limit } }
  ]);
};

CoupletSchema.statics.updateFavoriteCount = async function(id, increment = true) {
  const update = increment 
    ? { $inc: { favorites: 1 } }
    : { $inc: { favorites: -1 }, $min: { favorites: 0 } };

  const couplet = await this.findByIdAndUpdate(id, update, { new: true });
  return couplet ? couplet.favorites : null;
};

// 数据迁移方法（从JSON导入到MongoDB）
CoupletSchema.statics.migrateFromJSON = async function(jsonData) {
  try {
    // 清空现有数据
    await this.deleteMany({});
    
    // 插入新数据
    const data = jsonData.couplets || jsonData;
    const result = await this.insertMany(data);
    console.log(`✅ 数据迁移完成，插入了 ${result.length} 条记录`);
    return result;
  } catch (error) {
    console.error('❌ 数据迁移失败:', error);
    throw error;
  }
};

const CoupletModel = mongoose.model('Couplet', CoupletSchema);
module.exports = CoupletModel;