/**
 * 全局服务提供者模块
 * 统一管理所有需要在 amis 配置中调用的方法
 */

/**
 * 初始化全局服务命名空间
 */
function initGlobalProvider() {
  // 创建全局 AmisAppCore 对象
  if (!window.AmisAppCore) {
    window.AmisAppCore = {};
  }

  // 注册应用配置相关方法
  if (window.AppConfig) {
    window.AmisAppCore.config = {
      // 获取应用信息
      getAppInfo: () => window.AppConfig.APP_INFO,
      getApiConfig: () => window.AppConfig.API_CONFIG,
      getThemeConfig: () => window.AppConfig.THEME_CONFIG,

      // 便捷方法
      getAppConfig: window.AppConfig.getAppConfig,
      getGlobalContext: window.AppConfig.getGlobalContext,
      getThemeConfig: window.AppConfig.getThemeConfig
    };
  }

  // 注册应用管理相关方法
  if (window.AmisApp) {
    window.AmisAppCore.app = {
      // 获取应用实例
      getInstance: window.AmisApp.getInstance,
      getHistory: window.AmisApp.getHistory,

      // 应用控制
      getCurrentLocation: window.AmisApp.getCurrentLocation
    };
  }

  // 注册工具方法
  window.AmisAppCore.utils = {
    // 时间格式化
    formatDate: function(date, format = 'YYYY-MM-DD HH:mm:ss') {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      
      return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
    },
    
    // 生成随机ID
    generateId: function(prefix = 'id') {
      return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // 深拷贝
    deepClone: function(obj) {
      if (obj === null || typeof obj !== 'object') return obj;
      if (obj instanceof Date) return new Date(obj);
      if (obj instanceof Array) return obj.map(item => this.deepClone(item));
      if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
          cloned[key] = this.deepClone(obj[key]);
        });
        return cloned;
      }
    },
    
    // 防抖函数
    debounce: function(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },
    
    // 节流函数
    throttle: function(func, limit) {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    }
  };

  // 注册业务相关方法（可扩展）
  window.AmisAppCore.business = {
    // 示例：用户权限检查
    hasPermission: function(permission) {
      const user = window.API.auth?.getUser();
      return user?.permissions?.includes(permission) || false;
    },
    
    // 示例：格式化用户显示名称
    formatUserName: function(user) {
      if (!user) return '未知用户';
      return user.nickname || user.name || user.username || '未知用户';
    },
    
    // 示例：获取用户头像
    getUserAvatar: function(user) {
      if (!user) return '/images/default-avatar.png';
      return user.avatar || '/images/default-avatar.png';
    }
  };

  console.log('📦 全局服务提供者已注册完成');
  console.log('可用的服务:', Object.keys(window.AmisAppCore));
}

/**
 * 扩展全局服务
 * @param {string} namespace - 命名空间
 * @param {object} methods - 方法对象
 */
function extendGlobalProvider(namespace, methods) {
  if (!window.AmisAppCore) {
    window.AmisAppCore = {};
  }

  if (!window.AmisAppCore[namespace]) {
    window.AmisAppCore[namespace] = {};
  }

  Object.assign(window.AmisAppCore[namespace], methods);
  console.log(`📦 已扩展服务命名空间: ${namespace}`);
}

// 导出全局服务提供者管理器
window.AmisAppProvider = {
  init: initGlobalProvider,
  extend: extendGlobalProvider
};

console.log('📦 全局服务提供者管理器已加载');
