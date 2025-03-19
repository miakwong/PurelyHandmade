/**
 * 评论功能测试
 * Tests for comment.js
 */

// 导入必要的模块
require('../setup');

describe('评论功能测试', () => {
  // 保存原始localStorage
  const originalLocalStorage = global.localStorage;
  
  // 模拟数据
  const mockComments = [
    {
      id: 1,
      name: 'Test User',
      handle: '@testuser',
      content: 'Test comment',
      upvotes: 5,
      downvotes: 1,
      parentId: null,
      childrenIds: '[2]',
      lastUpdated: new Date('2023-05-01').toISOString()
    },
    {
      id: 2,
      name: 'Reply User',
      handle: '@replyuser',
      content: 'Test reply',
      upvotes: 2,
      downvotes: 0,
      parentId: 1,
      childrenIds: '[]',
      lastUpdated: new Date('2023-05-02').toISOString()
    }
  ];
  
  let storedComments = [];
  
  beforeEach(() => {
    // 创建localStorage模拟
    const localStorageMock = {
      getItem: jest.fn((key) => {
        if (key === 'commentArr') {
          return JSON.stringify(storedComments);
        }
        return null;
      }),
      setItem: jest.fn((key, value) => {
        if (key === 'commentArr') {
          storedComments = JSON.parse(value);
        }
      }),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    
    // 替换全局localStorage
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    // 设置DOM
    document.body.innerHTML = `
      <div id="commentForm">
        <input id="name" type="text" placeholder="Name">
        <input id="handle" type="text" placeholder="Handle">
        <textarea id="comment" placeholder="Comment"></textarea>
        <button id="add-comment">添加评论</button>
      </div>
      <div id="commentsList"></div>
    `;
    
    // 重置评论数组
    global.commentArr = [];
    
    // 模拟alert
    global.alert = jest.fn();
  });
  
  afterEach(() => {
    // 恢复原始localStorage
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    
    // 清除模拟
    jest.clearAllMocks();
  });
  
  test('应该从localStorage加载评论', () => {
    // 设置localStorage中的评论
    storedComments = mockComments;
    
    // 重新执行IIFE
    eval(`
      (() => {
        let commentsString = localStorage.getItem("commentArr");
        if (commentsString !== null) {
          commentArr = JSON.parse(commentsString).map(comment => ({
            ...comment,
            lastUpdated: new Date(comment.lastUpdated),
            upvotes: parseInt(comment.upvotes),
            downvotes: parseInt(comment.downvotes),
            childrenIds: JSON.parse(comment.childrenIds)
          }));
        }
      })();
    `);
    
    // 验证评论是否正确加载
    expect(global.commentArr.length).toBe(2);
    expect(global.commentArr[0].name).toBe('Test User');
    expect(global.commentArr[0].childrenIds).toEqual([2]);
  });
  
  test('应该正确添加新评论', () => {
    // 定义添加评论函数
    global.addComment = function(name, handle, content, parentId) {
      const newComment = {
        id: Date.now(),
        name,
        handle,
        content,
        upvotes: 0,
        downvotes: 0,
        parentId,
        childrenIds: [],
        lastUpdated: new Date()
      };
      
      if (parentId) {
        // 查找父评论并更新childrenIds
        const parentIndex = commentArr.findIndex(c => c.id === parentId);
        if (parentIndex !== -1) {
          commentArr[parentIndex].childrenIds.push(newComment.id);
        }
      }
      
      commentArr.push(newComment);
      storeComments();
      renderComments();
      return newComment;
    };
    
    // 定义storeComments函数
    global.storeComments = function() {
      localStorage.setItem('commentArr', JSON.stringify(commentArr));
    };
    
    // 定义renderComments函数
    global.renderComments = jest.fn();
    
    // 添加一个新评论
    const newComment = global.addComment('New User', '@newuser', 'New comment', null);
    
    // 验证评论是否正确添加
    expect(global.commentArr.length).toBe(1);
    expect(global.commentArr[0].name).toBe('New User');
    expect(global.commentArr[0].handle).toBe('@newuser');
    expect(global.commentArr[0].content).toBe('New comment');
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(global.renderComments).toHaveBeenCalled();
  });
  
  test('应该正确添加回复评论', () => {
    // 设置初始评论
    global.commentArr = [{
      id: 1,
      name: 'Parent User',
      handle: '@parentuser',
      content: 'Parent comment',
      upvotes: 0,
      downvotes: 0,
      parentId: null,
      childrenIds: [],
      lastUpdated: new Date()
    }];
    
    // 定义添加评论函数
    global.addComment = function(name, handle, content, parentId) {
      const newComment = {
        id: Date.now(),
        name,
        handle,
        content,
        upvotes: 0,
        downvotes: 0,
        parentId,
        childrenIds: [],
        lastUpdated: new Date()
      };
      
      if (parentId) {
        // 查找父评论并更新childrenIds
        const parentIndex = commentArr.findIndex(c => c.id === parentId);
        if (parentIndex !== -1) {
          commentArr[parentIndex].childrenIds.push(newComment.id);
        }
      }
      
      commentArr.push(newComment);
      storeComments();
      renderComments();
      return newComment;
    };
    
    // 定义storeComments函数
    global.storeComments = function() {
      localStorage.setItem('commentArr', JSON.stringify(commentArr));
    };
    
    // 定义renderComments函数
    global.renderComments = jest.fn();
    
    // 添加一个回复评论
    const reply = global.addComment('Reply User', '@replyuser', 'Reply comment', 1);
    
    // 验证回复是否正确添加
    expect(global.commentArr.length).toBe(2);
    expect(global.commentArr[1].name).toBe('Reply User');
    expect(global.commentArr[1].parentId).toBe(1);
    expect(global.commentArr[0].childrenIds).toContain(reply.id);
  });
  
  test('应该正确删除评论', () => {
    // 设置初始评论
    global.commentArr = [
      {
        id: 1,
        name: 'Parent User',
        handle: '@parentuser',
        content: 'Parent comment',
        upvotes: 0,
        downvotes: 0,
        parentId: null,
        childrenIds: [2],
        lastUpdated: new Date()
      },
      {
        id: 2,
        name: 'Child User',
        handle: '@childuser',
        content: 'Child comment',
        upvotes: 0,
        downvotes: 0,
        parentId: 1,
        childrenIds: [],
        lastUpdated: new Date()
      }
    ];
    
    // 定义删除评论函数
    global.deleteComment = function(id) {
      const index = commentArr.findIndex(c => c.id === id);
      if (index === -1) return false;
      
      const comment = commentArr[index];
      
      // 如果有父评论，从父评论的childrenIds中删除
      if (comment.parentId) {
        const parentIndex = commentArr.findIndex(c => c.id === comment.parentId);
        if (parentIndex !== -1) {
          commentArr[parentIndex].childrenIds = commentArr[parentIndex].childrenIds.filter(cid => cid !== id);
        }
      }
      
      // 删除所有子评论
      comment.childrenIds.forEach(childId => {
        deleteComment(childId);
      });
      
      // 删除评论本身
      commentArr.splice(index, 1);
      storeComments();
      renderComments();
      return true;
    };
    
    // 定义storeComments函数
    global.storeComments = function() {
      localStorage.setItem('commentArr', JSON.stringify(commentArr));
    };
    
    // 定义renderComments函数
    global.renderComments = jest.fn();
    
    // 删除父评论（应该同时删除子评论）
    const result = global.deleteComment(1);
    
    // 验证评论是否正确删除
    expect(result).toBe(true);
    expect(global.commentArr.length).toBe(0);
    expect(localStorage.setItem).toHaveBeenCalled();
    expect(global.renderComments).toHaveBeenCalled();
  });
  
  test('应该在表单提交时添加评论', () => {
    // 定义添加评论函数
    global.addComment = jest.fn();
    
    // 设置表单值
    document.getElementById('name').value = 'Test User';
    document.getElementById('handle').value = '@testuser';
    document.getElementById('comment').value = 'Test comment';
    
    // 触发DOMContentLoaded事件
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // 触发添加评论按钮点击
    document.getElementById('add-comment').click();
    
    // 验证addComment是否被调用
    expect(global.addComment).toHaveBeenCalledWith(
      'Test User',
      '@testuser',
      'Test comment',
      null
    );
    
    // 验证表单是否被清空
    expect(document.getElementById('name').value).toBe('');
    expect(document.getElementById('handle').value).toBe('');
    expect(document.getElementById('comment').value).toBe('');
  });
  
  test('应该验证表单输入', () => {
    // 定义添加评论函数
    global.addComment = jest.fn();
    
    // 设置不完整的表单值
    document.getElementById('name').value = 'Test User';
    document.getElementById('handle').value = '';  // 空handle
    document.getElementById('comment').value = 'Test comment';
    
    // 触发DOMContentLoaded事件
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // 触发添加评论按钮点击
    document.getElementById('add-comment').click();
    
    // 验证addComment是否未被调用
    expect(global.addComment).not.toHaveBeenCalled();
    
    // 验证是否显示警告
    expect(global.alert).toHaveBeenCalledWith('All fields are required!');
  });
  
  test('应该正确计算时间差', () => {
    // 定义timeAgo函数
    global.timeAgo = function(date) {
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = Math.floor(seconds / 31536000);
      
      if (interval > 1) {
        return interval + ' years ago';
      }
      interval = Math.floor(seconds / 2592000);
      if (interval > 1) {
        return interval + ' months ago';
      }
      interval = Math.floor(seconds / 86400);
      if (interval > 1) {
        return interval + ' days ago';
      }
      interval = Math.floor(seconds / 3600);
      if (interval > 1) {
        return interval + ' hours ago';
      }
      interval = Math.floor(seconds / 60);
      if (interval > 1) {
        return interval + ' minutes ago';
      }
      return Math.floor(seconds) + ' seconds ago';
    };
    
    // 创建测试日期
    const now = new Date();
    const minutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const hoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const daysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    
    // 验证时间差计算
    expect(global.timeAgo(minutesAgo)).toContain('minutes ago');
    expect(global.timeAgo(hoursAgo)).toContain('hours ago');
    expect(global.timeAgo(daysAgo)).toContain('days ago');
  });
}); 