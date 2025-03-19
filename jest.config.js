module.exports = {
  // 测试环境是jsdom（浏览器环境）
  testEnvironment: 'jsdom',
  
  // 测试文件的匹配模式
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // 忽略的文件夹
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  
  // 测试覆盖率设置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/client/js/**/*.js'
  ],
  
  // 每个测试文件运行前的设置
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],
  
  // 模块路径别名
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // 显示测试报告的详细程度
  verbose: true,
  
  // 超时设置（毫秒）
  testTimeout: 10000
}; 