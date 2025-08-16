/**
 * Amis 应用配置和初始化模块
 * 负责整个应用的配置、初始化和启动
 */

// 全局变量
let amisInstance = null;
let history = null;

/**
 * 获取应用配置（从 config.js 中获取）
 */
function getAppConfig() {
  const baseConfig = window.AppConfig ? window.AppConfig.getAppConfig() : {
    type: 'app',
    brandName: '管理系统',
    api: '/pages/app.json'
  };

  // 添加 header 配置
  return {
    ...baseConfig,
    header: {
      type: "flex",
      justify: "end",
      className: "w-full",
      items: [
        {
          type: "dropdown-button",
          label: "${userName}",
          icon: "fa fa-user-circle",
          level: "link",
          className: "text-white",
          buttons: [
            {
              type: "button",
              label: "个人信息",
              icon: "fa fa-user",
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: "toast",
                      args: {
                        msgType: "info",
                        msg: "个人信息功能开发中..."
                      }
                    }
                  ]
                }
              }
            },
            {
              type: "divider"
            },
            {
              type: "button",
              label: "退出登录",
              icon: "fa fa-sign-out",
              onEvent: {
                click: {
                  actions: [
                    {
                      actionType: "custom",
                      script: "window.AmisAppCore.auth.logout(); window.location.reload();"
                    }
                  ]
                }
              }
            }
          ]
        }
      ]
    }
  };
}

/**
 * 获取登录页面配置
 */
function getLoginConfig() {
  return {
    type: 'service',
    schemaApi: '/pages/login.json'
  };
}

/**
 * 获取全局数据配置
 */
function getGlobalData() {
  // 获取应用配置信息
  const appInfo = window.AppConfig ? window.AppConfig.APP_INFO : {
    name: '管理系统',
    brandName: '管理系统'
  };

  // 获取当前用户信息
  const currentUser = window.AmisAppCore ? window.AmisAppCore.auth.getUser() : null;
  const userName = currentUser ? (currentUser.name || currentUser.username || '未知用户') : '未登录';

  return {
    // 应用配置信息
    appName: appInfo.name,
    brandName: appInfo.brandName,
    appVersion: appInfo.version || '1.0.0',
    appDescription: appInfo.description || 'Amis Starter 低代码前端应用',

    // 用户信息
    currentUser: currentUser,
    userName: userName,
    userAvatar: currentUser?.avatar || null
  };
}

/**
 * 获取全局上下文配置（从 config.js 中获取）
 */
function getGlobalContext() {
  return window.AppConfig ? window.AppConfig.getGlobalContext() : {
    API_HOST: 'https://3xsw4ap8wah59.cfc-execute.bj.baidubce.com'
  };
}

/**
 * 标准化链接地址
 * @param {string} to - 目标地址
 * @param {object} location - 当前位置对象
 * @returns {string} 标准化后的地址
 */
function normalizeLink(to, location = history?.location || window.location) {
  to = to || '';
  
  if (to && to[0] === '#') {
    to = location.pathname + location.search + to;
  } else if (to && to[0] === '?') {
    to = location.pathname + to;
  }
  
  return to;
}

/**
 * 检查是否为当前URL
 * @param {string} to - 目标地址
 * @returns {boolean} 是否为当前URL
 */
function isCurrentUrl(to) {
  if (!to || !history) return false;
  
  const pathname = history.location.pathname;
  return pathname === to || pathname === to.replace('#', '');
}

/**
 * 更新位置信息
 * @param {string} location - 新位置
 * @param {boolean} replace - 是否替换当前历史记录
 */
function updateLocation(location, replace) {
  if (!history) return;
  
  location = normalizeLink(location);
  
  if (location === 'goBack') {
    return history.goBack();
  }
  
  history[replace ? 'replace' : 'push'](location);
}

/**
 * 跳转到指定地址
 * @param {string} to - 目标地址
 * @param {object} action - 动作配置
 */
function jumpTo(to, action) {
  if (to === 'goBack' && history) {
    return history.goBack();
  }

  to = normalizeLink(to);

  // 处理URL动作
  if (action && action.actionType === 'url') {
    action.blank === false
      ? (window.location.href = to)
      : window.open(to, '_blank');
    return;
  } else if (action && action.blank) {
    window.open(to, '_blank');
    return;
  }

  // 处理外部链接
  if (/^https?:\/\//.test(to)) {
    window.location.href = to;
  } else if (history) {
    history.push(to);
  }
}

/**
 * 获取完整的 amis 配置
 * @returns {object} amis 配置对象
 */
function getAmisConfig() {
  const themeConfig = window.AppConfig ? window.AppConfig.getThemeConfig() : { theme: 'cxd' };

  return {
    updateLocation,
    jumpTo,
    isCurrentUrl,
    ...themeConfig,

    // 请求适配器 - 自动添加认证头
    requestAdaptor: function(api) {
      // 使用认证管理器的请求处理器
      if (window.AmisAppCore?.auth) {
        api = window.AmisAppCore.auth.authRequestHandler(api);
      }

      // 可以在这里添加其他全局请求配置
      // 如：统一的错误处理、请求日志等

      return api;
    },

    // 响应适配器 - 处理认证相关响应
    responseAdaptor: function(api, payload, query, request) {
      // 使用认证管理器的响应处理器
      if (window.AmisAppCore?.auth) {
        const response = { status: request.status, data: payload };
        window.AmisAppCore.auth.authResponseHandler(response);
      }

      // 可以在这里添加其他全局响应处理
      // 如：统一的错误提示、数据格式化等

      return payload;
    }
  };
}

/**
 * 获取当前位置信息
 * @returns {object} 位置信息
 */
function getCurrentLocation() {
  return history?.location || { pathname: '/' };
}

/**
 * 初始化路由历史对象
 */
function initHistory() {
  // 检查 History 库是否已加载
  if (typeof window.History === 'undefined') {
    console.warn('⚠️ History 库未加载，路由功能将受限');
    return null;
  }

  // 创建 hash 路由历史对象
  history = window.History.createHashHistory();
  console.log('✅ 路由历史对象初始化成功');
  
  return history;
}

/**
 * 启动路由监听
 */
function startRouteListener() {
  if (!history || !amisInstance) {
    console.warn('⚠️ 路由监听启动失败：缺少必要的依赖');
    return;
  }

  // 监听路由变化
  history.listen(state => {
    // 路由更新时检测token状态
    if (window.AmisAppCore?.auth && !window.AmisAppCore.auth.hasToken()) {
      console.warn('⚠️ 路由更新时发现token缺失，需要重新登录');
      window.AmisAppCore.auth.logout();
      window.location.reload();
      return;
    }

    amisInstance.updateProps({
      location: state.location || state
    });
  });

  console.log('✅ 路由监听已启动');
}

/**
 * 初始化并启动 Amis 应用
 */
function initAmisApp() {
  try {
    // 检查依赖是否加载完成
    if (typeof amisRequire === 'undefined') {
      document.getElementById('root').innerHTML =
        '<div style="text-align: center; padding: 50px; color: #e74c3c;">' +
        '<h2>❌ 加载失败</h2>' +
        '<p>amis SDK 未正确加载，请运行 <code>npm run init</code> 初始化资源</p>' +
        '</div>';
      return;
    }

    // 初始化全局服务提供者
    if (window.AmisAppProvider) {
      window.AmisAppProvider.init();
    }

    let amis = amisRequire('amis/embed');

    // 检查用户是否已登录
    const isLoggedIn = window.AmisAppCore?.auth ? window.AmisAppCore.auth.isLoggedIn() : false;

    if (isLoggedIn) {
      // 用户已登录，渲染主应用
      console.log('✅ 用户已登录，渲染主应用');

      // 初始化路由历史管理
      initHistory();

      // 渲染应用
      amisInstance = amis.embed(
        '#root',
        getAppConfig(),
        {
          location: getCurrentLocation(),
          data: getGlobalData(),
          context: getGlobalContext()
        },
        getAmisConfig()
      );

      // 启动路由监听
      startRouteListener();

    } else {
      // 用户未登录，渲染登录页面
      console.log('⚠️ 用户未登录，渲染登录页面');

      // 渲染登录页面
      amisInstance = amis.embed(
        '#root',
        getLoginConfig(),
        {
          data: getGlobalData(),
          context: getGlobalContext()
        },
        getAmisConfig()
      );
    }

    console.log('🎉 Amis Starter 应用启动成功！');

  } catch (error) {
    console.error('❌ 应用启动失败:', error);
    document.getElementById('root').innerHTML =
      '<div style="text-align: center; padding: 50px; color: #e74c3c;">' +
      '<h2>❌ 启动失败</h2>' +
      '<p>应用初始化过程中发生错误，请检查控制台获取详细信息</p>' +
      '</div>';
  }
}

// 导出模块接口
window.AmisApp = {
  initAmisApp,
  getAmisConfig,
  getCurrentLocation,
  
  // 获取实例（用于调试）
  getInstance: () => amisInstance,
  getHistory: () => history
};

console.log('📦 Amis 应用模块已加载');
