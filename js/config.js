/**
 * 应用配置文件
 * 包含应用的基础配置信息，如名称、logo、API地址等
 */

// 应用基础配置
const APP_INFO = {
  // 应用名称
  name: '管理系统',
  // 应用版本
  version: '1.0.0',
  // 应用描述
  description: 'Amis Starter 低代码前端应用',
  // 品牌名称（显示在导航栏）
  brandName: '管理系统',
  // Logo 配置
  logo: {
    // Logo 图片地址（可选）
    image: null,
    // Logo 文字（仅当有图片时显示，没有图片时不显示logo）
    text: null,
    // Logo 链接（点击跳转地址）
    link: '/'
  }
};

// API 配置
const API_CONFIG = {
  // 应用配置 API
  app: '/pages/app.json',
  // API 主机地址
  host: 'https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com'
};

// 主题配置
const THEME_CONFIG = {
  // 主题名称：default, cxd, dark, ang, antd
  name: 'cxd',
  // 是否启用暗色模式
  darkMode: false
};

// 路由配置
const ROUTER_CONFIG = {
  // 路由模式：hash, browser
  mode: 'hash',
  // 默认路由
  defaultRoute: '/'
};

// 功能配置
const FEATURE_CONFIG = {
  // 是否启用多语言
  i18n: false,
  // 是否启用全屏功能
  fullscreen: true,
  // 是否显示页面标题
  showPageTitle: true,
  // 是否显示面包屑导航
  showBreadcrumb: true
};

// 开发配置
const DEV_CONFIG = {
  // 是否启用调试模式
  debug: false,
  // 是否显示性能监控
  performance: false,
  // 控制台日志级别：error, warn, info, debug
  logLevel: 'info'
};

// 导出配置对象
window.AppConfig = {
  APP_INFO,
  API_CONFIG,
  THEME_CONFIG,
  ROUTER_CONFIG,
  FEATURE_CONFIG,
  DEV_CONFIG,
  
  // 便捷方法：获取完整的应用配置
  getAppConfig() {
    const config = {
      type: 'app',
      brandName: APP_INFO.brandName,
      api: API_CONFIG.app
    };

    // 只有当有 logo 图片或文字时才添加 logo 属性
    const logo = APP_INFO.logo.image || APP_INFO.logo.text;
    if (logo) {
      config.logo = logo;
    }

    return config;
  },
  
  // 便捷方法：获取全局上下文
  getGlobalContext() {
    return {
      API_HOST: API_CONFIG.host,
      APP_NAME: APP_INFO.name,
      APP_VERSION: APP_INFO.version
    };
  },
  
  // 便捷方法：获取主题配置
  getThemeConfig() {
    return {
      theme: THEME_CONFIG.name
    };
  }
};

console.log('📦 应用配置模块已加载');
