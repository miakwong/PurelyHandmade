/**
 * 全局Alert拦截器
 * 完全替换所有alert/confirm/prompt为更现代的非阻塞通知
 */

(function() {
  // 保存所有原始对话框函数
  const originalAlert = window.alert;
  const originalConfirm = window.confirm;
  const originalPrompt = window.prompt;
  
  // 拦截记录
  window.interceptedDialogs = {
    alerts: [],
    confirms: [],
    prompts: []
  };
  
  // 创建Toast容器
  function ensureToastContainer() {
    let container = document.querySelector('.global-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'global-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }
  
  // 创建并显示Toast
  function showToast(message, type = 'info', title = null, duration = 3000) {
    try {
      const container = ensureToastContainer();
      
      // 创建Toast元素
      const toast = document.createElement('div');
      toast.className = `global-toast global-toast-${type}`;
      
      // 添加内容
      let toastContent = '';
      if (title) {
        toastContent += `<div class="global-toast-header p-2">${title}</div>`;
      }
      toastContent += `<div class="global-toast-body">${message}</div>`;
      toast.innerHTML = toastContent;
      
      // 添加到容器
      container.appendChild(toast);
      
      // 设置自动消失
      setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
          container.removeChild(toast);
        }, 300);
      }, duration);
      
      return true;
    } catch (error) {
      console.error('Failed to show toast notification:', error);
      return false;
    }
  }
  
  // 暴露showToast方法全局使用
  window.showToast = showToast;
  
  // 替换alert函数
  window.alert = function(message) {
    // 记录调用
    const callInfo = {
      message: message,
      time: new Date().toISOString(),
      stack: new Error().stack,
      url: window.location.href
    };
    
    window.interceptedDialogs.alerts.push(callInfo);
    console.log('Alert intercepted:', message);
    
    // 显示Toast通知
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        showToast(message, 'info', '提示') || originalAlert(message);
      });
    } else {
      showToast(message, 'info', '提示') || originalAlert(message);
    }
  };
  
  // 替换confirm函数 - 使用非阻塞的回调方式
  window.confirm = function(message) {
    // 记录调用
    const callInfo = {
      message: message,
      time: new Date().toISOString(),
      stack: new Error().stack,
      url: window.location.href
    };
    
    window.interceptedDialogs.confirms.push(callInfo);
    console.log('Confirm intercepted:', message);
    
    // 使用Toast通知告知用户
    showToast(`注意: 系统请求确认 "${message}"，默认为确认。`, 'warning', '确认请求');
    
    // 默认返回true以不影响流程
    return true;
  };
  
  // 替换prompt函数 - 使用非阻塞的回调方式
  window.prompt = function(message, defaultValue) {
    // 记录调用
    const callInfo = {
      message: message,
      defaultValue: defaultValue,
      time: new Date().toISOString(),
      stack: new Error().stack,
      url: window.location.href
    };
    
    window.interceptedDialogs.prompts.push(callInfo);
    console.log('Prompt intercepted:', message, defaultValue);
    
    // 使用Toast通知告知用户
    showToast(`注意: 系统请求输入 "${message}"，已自动处理。`, 'warning', '输入请求');
    
    // 返回默认值以不影响流程
    return defaultValue || '';
  };
  
  // 在控制台提供恢复原始函数的方法
  window.restoreOriginalDialogs = function() {
    window.alert = originalAlert;
    window.confirm = originalConfirm;
    window.prompt = originalPrompt;
    console.log('Original dialog functions restored');
  };
  
  // 在页面加载完成后创建容器
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureToastContainer);
  } else {
    ensureToastContainer();
  }
  
  console.log('🔒 Alert/Confirm/Prompt functions replaced with non-blocking notifications');
})(); 