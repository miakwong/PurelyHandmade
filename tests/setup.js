/**
 * Jest测试配置文件
 * 
 * 这个文件会在每个测试文件运行之前加载，用于设置测试环境
 */

// 添加全局TextEncoder和TextDecoder，这是JSDOM所需的
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// 设置测试环境
const { JSDOM } = require('jsdom');

// 创建虚拟DOM环境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8080/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});

// 将DOM对象添加到全局环境
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.navigator = dom.window.navigator;
global.Node = dom.window.Node;
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

// 模拟fetch API
global.fetch = jest.fn();

// 模拟window的常用方法和属性
Object.defineProperty(global.window, 'location', {
  value: {
    href: 'http://localhost:8080/',
    pathname: '/',
    origin: 'http://localhost:8080',
    protocol: 'http:',
    host: 'localhost:8080',
    hostname: 'localhost',
    port: '8080',
    search: '',
    hash: '',
    reload: jest.fn(),
    replace: jest.fn(),
    assign: jest.fn()
  },
  writable: true
});

// 模拟Bootstrap组件
global.bootstrap = {
  Modal: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn()
  })),
  Toast: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn()
  })),
  Tooltip: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn()
  }))
};

// 其他常用的DOM API
Object.defineProperty(global.window.HTMLElement.prototype, 'innerText', {
  get() {
    return this.textContent;
  },
  set(value) {
    this.textContent = value;
  }
});

// 模拟console.log等方法
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// 在每次测试后清除所有模拟
afterEach(() => {
  jest.clearAllMocks();
});

/**
 * 测试全局设置
 */

// 增加测试超时时间
jest.setTimeout(30000);

// 创建测试环境变量
process.env.NODE_ENV = 'test';
process.env.SERVER_PORT = '9877'; // 使用不同的测试端口
process.env.DATABASE_URL = 'mysql://root:15879512@localhost:3306/purely_handmade_test'; // 测试数据库

// 创建全局变量以在测试之间共享
global.testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    token: null
  },
  user: {
    email: 'user@test.com',
    password: 'user123',
    token: null
  }
};

// 在所有测试前清理
beforeAll(async () => {
  // 可以在此处添加测试前的数据库清理或其他设置
});

// 在所有测试后清理
afterAll(async () => {
  // 可以在此处添加测试后的数据库清理或其他清理步骤
}); 