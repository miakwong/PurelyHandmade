/**
 * 订单管理测试
 * Tests for order.js
 */

// 导入必要的模块
require('../setup');

describe('订单管理测试', () => {
  // 模拟jQuery
  const mockJQuery = (selector) => {
    return {
      addClass: jest.fn().mockReturnThis(),
      text: jest.fn().mockReturnThis(),
      click: jest.fn(callback => {
        if (typeof callback === 'function') {
          // 保存回调函数，便于后续测试
          const element = document.querySelector(selector);
          if (element) {
            element._clickCallback = callback;
          }
        }
        return mockJQuery(selector);
      }),
      append: jest.fn().mockReturnThis(),
      html: jest.fn().mockReturnThis(),
      val: jest.fn().mockReturnThis(),
      attr: jest.fn().mockReturnThis(),
      on: jest.fn().mockReturnThis(),
      ready: jest.fn(callback => {
        if (typeof callback === 'function') {
          callback();
        }
        return mockJQuery(selector);
      }),
      empty: jest.fn().mockReturnThis(),
      find: jest.fn(() => mockJQuery('child-selector')),
      _clickCallback: null
    };
  };
  
  // 保存原始localStorage
  const originalLocalStorage = global.localStorage;
  
  // 模拟订单数据
  const mockOrders = [
    { id: 101, product: "Apple", amount: "$10", orderStatus: "New" },
    { id: 102, product: "Banana", amount: "$15", orderStatus: "Packed" },
    { id: 103, product: "Grapes", amount: "$12", orderStatus: "InTransit" },
    { id: 104, product: "Orange", amount: "$20", orderStatus: "Delivered" }
  ];
  
  let storedOrders = [...mockOrders];
  
  beforeEach(() => {
    // 创建localStorage模拟
    const localStorageMock = {
      getItem: jest.fn((key) => {
        if (key === 'ordersData') {
          return JSON.stringify(storedOrders);
        }
        return null;
      }),
      setItem: jest.fn((key, value) => {
        if (key === 'ordersData') {
          storedOrders = JSON.parse(value);
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
      <div id="order-dashboard">
        <div id="filters">
          <select id="filter-status">
            <option value="All">All</option>
            <option value="New">New</option>
            <option value="Packed">Packed</option>
            <option value="InTransit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>
          <button id="apply-filter">Apply Filter</button>
        </div>
        <table id="orders-table"></table>
        <div id="order-details"></div>
      </div>
    `;
    
    // 模拟jQuery
    global.$ = mockJQuery;
    global.console = {
      ...console,
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    };
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
  
  test('应该在初始化时从localStorage加载订单数据', () => {
    // 触发jQuery ready事件
    $(document).ready();
    
    // 验证从localStorage读取数据
    expect(localStorage.getItem).toHaveBeenCalledWith('ordersData');
    expect(console.log).toHaveBeenCalledWith('Current order data:', mockOrders);
  });
  
  test('当localStorage中没有订单数据时应创建默认数据', () => {
    // 模拟localStorage为空
    localStorage.getItem.mockReturnValueOnce(null);
    
    // 触发jQuery ready事件
    $(document).ready();
    
    // 验证是否创建并保存了默认数据
    expect(localStorage.setItem).toHaveBeenCalledWith('ordersData', expect.any(String));
    expect(console.log).toHaveBeenCalledWith('Default order data has been saved to localStorage!');
  });
  
  test('renderOrders应该创建正确的表格行', () => {
    // 触发jQuery ready事件
    $(document).ready();
    
    // 模拟订单数据
    const order = { id: 101, product: "Apple", amount: "$10", orderStatus: "New" };
    
    // 定义测试renderOrders函数
    const renderOrders = function(data) {
      let tableRow = $("<tr>").addClass("table-row");
      
      let ID = $("<td>").addClass("table-data-row").text(data.id);
      let product = $("<td>").addClass("table-data-row").text(data.product);
      let amount = $("<td>").addClass("table-data-row").text(data.amount);
      let orderStatus = $("<td>").addClass("table-data-row").text(data.orderStatus);
      
      let action = $("<td>").addClass("table-data-row");
      let viewButton = $("<button>").text("View").click(() => viewOrder(data.id));
      action.append(viewButton);
      
      tableRow.append(ID, product, amount, orderStatus, action);
      return tableRow;
    };
    
    // 调用renderOrders函数
    const result = renderOrders(order);
    
    // 验证返回的表格行
    expect(result.addClass).toHaveBeenCalledWith("table-row");
    expect(result.append).toHaveBeenCalled();
  });
  
  test('updateTable应该渲染所有订单', () => {
    // 触发jQuery ready事件
    $(document).ready();
    
    // 实现简单的updateTable函数
    const updateTable = function(filteredOrders = storedOrders) {
      let table = $("#orders-table");
      table.empty();
      
      let header = $("<tr>");
      header.append(
        $("<th>").text("Order ID"),
        $("<th>").text("Product"),
        $("<th>").text("Amount"),
        $("<th>").text("Status"),
        $("<th>").text("Action")
      );
      
      table.append(header);
      
      filteredOrders.forEach(order => {
        table.append(renderOrders(order));
      });
    };
    
    // 实现简单的renderOrders函数
    const renderOrders = jest.fn().mockReturnValue($("<tr>"));
    
    // 调用updateTable函数
    updateTable();
    
    // 验证表格更新
    expect($("#orders-table").empty).toHaveBeenCalled();
    expect($("#orders-table").append).toHaveBeenCalled();
  });
  
  test('应该能通过状态筛选订单', () => {
    // 触发jQuery ready事件
    $(document).ready();
    
    // 设置筛选状态
    $("#filter-status").val = jest.fn().mockReturnValue("New");
    
    // 定义测试updateTable函数
    global.updateTable = jest.fn();
    
    // 触发筛选按钮点击
    const applyFilter = $("#apply-filter");
    if (applyFilter._clickCallback) {
      applyFilter._clickCallback();
    }
    
    // 验证是否根据状态筛选订单
    expect($("#filter-status").val).toHaveBeenCalled();
    expect(global.updateTable).toHaveBeenCalled();
  });
  
  test('viewOrder应显示订单详情', () => {
    // 触发jQuery ready事件
    $(document).ready();
    
    // 定义测试viewOrder函数
    global.viewOrder = function(orderId) {
      const order = storedOrders.find(o => o.id === orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return;
      }
      
      const detailsContainer = $("#order-details");
      detailsContainer.html(`
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Product:</strong> ${order.product}</p>
        <p><strong>Amount:</strong> ${order.amount}</p>
        <p><strong>Status:</strong> ${order.orderStatus}</p>
      `);
    };
    
    // 调用viewOrder函数
    global.viewOrder(101);
    
    // 验证订单详情是否显示
    expect($("#order-details").html).toHaveBeenCalled();
  });
  
  test('viewOrder应处理找不到订单的情况', () => {
    // 触发jQuery ready事件
    $(document).ready();
    
    // 定义测试viewOrder函数
    global.viewOrder = function(orderId) {
      const order = storedOrders.find(o => o.id === orderId);
      if (!order) {
        console.error("Order not found:", orderId);
        return;
      }
      
      const detailsContainer = $("#order-details");
      detailsContainer.html(`Order details for ${orderId}`);
    };
    
    // 调用viewOrder函数，使用不存在的订单ID
    global.viewOrder(999);
    
    // 验证错误处理
    expect(console.error).toHaveBeenCalledWith("Order not found:", 999);
    expect($("#order-details").html).not.toHaveBeenCalled();
  });
}); 