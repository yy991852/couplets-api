// models/Couplet.js
const path = require('path');
const fs = require('fs');

class CoupletDatabase {
  constructor() {
    this.couplets = new Map();
    this.initializeMockData();
  }

  // 修改为更安全的初始化方法
  initializeMockData() {
    try {
      // 尝试多种路径
      let dataPath;
      
      // 方案1：尝试相对路径
      try {
        dataPath = path.join(__dirname, '../database/couplets_data.json');
        if (fs.existsSync(dataPath)) {
          this.loadFromFile(dataPath);
          return;
        }
      } catch (e) {}
      
      // 方案2：尝试根目录路径
      try {
        dataPath = path.join(__dirname, '../../database/couplets_data.json');
        if (fs.existsSync(dataPath)) {
          this.loadFromFile(dataPath);
          return;
        }
      } catch (e) {}
      
      // 方案3：如果都找不到，使用内置数据
      console.log('JSON文件未找到，使用内置模拟数据');
      this.loadDefaultData();
      
    } catch (error) {
      console.error('初始化数据失败:', error.message);
      this.loadDefaultData();
    }
  }

  loadFromFile(filePath) {
    const mockData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    this.processData(mockData);
  }

  loadDefaultData() {
    // 内置测试数据
    const defaultData = {
      couplets: [
        {
          id: 1,
          title: '新春祝福',
          upper_line: '福如东海长流水',
          lower_line: '寿比南山不老松',
          category: '春节',
          description: '传统新春祝福对联',
          author: '佚名',
          origin: '传统',
          meaning: '祝福长寿富贵',
          usage: '春节祝福',
          tags: ['春节', '祝福', '长寿'],
          recommended: true,
          views: 150,
          favorites: 30
        },
        {
          id: 2,
          title: '生意兴隆',
          upper_line: '生意兴隆通四海',
          lower_line: '财源茂盛达三江',
          category: '商业',
          description: '商业祝福对联',
          author: '佚名',
          origin: '商业传统',
          meaning: '祝愿生意兴旺',
          usage: '商业祝福',
          tags: ['商业', '财运', '生意'],
          recommended: true,
          views: 120,
          favorites: 25
        },
        {
          id: 3,
          title: '家庭和睦',
          upper_line: '家和万事兴',
          lower_line: '人勤百业旺',
          category: '家庭',
          description: '家庭和睦对联',
          author: '佚名',
          origin: '民间传统',
          meaning: '家庭和睦是万事兴旺的基础',
          usage: '家庭祝福',
          tags: ['家庭', '和睦', '兴旺'],
          recommended: false,
          views: 80,
          favorites: 15
        }
      ]
    };
    
    this.processData(defaultData);
  }

  processData(mockData) {
    mockData.couplets.forEach(coupletData => {
      const couplet = new Couplet(coupletData.id, coupletData);
      this.couplets.set(coupletData.id, couplet);
    });
    console.log(`初始化了 ${this.couplets.size} 条对联数据`);
  }

  // ... 其他方法保持不变 ...
}