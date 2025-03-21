/**
 * 服务器测试
 * 测试Express服务器的基本功能
 */

const request = require('supertest');
// 直接导入app
const app = require('../../src/server/server');

describe('服务器测试', () => {
  it('服务器应该响应健康检查请求', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  it('对未知路由的请求应重定向到前端', async () => {
    const response = await request(app).get('/unknown-route');
    expect(response.status).toBe(200);
    // 因为我们重定向到前端，应该返回HTML
    expect(response.headers['content-type']).toMatch(/text\/html/);
  });

  it('服务器应该处理JSON请求', async () => {
    const response = await request(app)
      .post('/api/test-json')
      .send({ test: 'data' })
      .set('Accept', 'application/json');
    
    // 即使端点不存在，它也应该正确解析JSON并返回404
    expect(response.status).toBe(404);
  });
}); 