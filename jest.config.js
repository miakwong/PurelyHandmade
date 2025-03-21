module.exports = {
  // 测试环境是node（服务器环境）
  testEnvironment: 'node',
  
  // 测试文件的匹配模式
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // 测试覆盖率设置
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/server/**/*.js',
    '!src/server/seed.js'
  ],
  coverageReporters: ['text', 'lcov'],
  
  // 每个测试文件运行前的设置
  setupFiles: [
    './tests/backend/utils/test-setup.js'
  ],
  
  // 每个测试运行后的设置
  setupFilesAfterEnv: [
    './tests/setup.js'
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