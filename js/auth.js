/**
 * 认证管理模块
 * 负责管理用户认证信息，包括 token 的存储、获取和验证
 */

// 存储配置
const STORAGE_CONFIG = {
  // token 存储键名
  TOKEN_KEY: 'amis_starter_token',
  // 用户信息存储键名
  USER_KEY: 'amis_starter_user',
  // 存储类型：localStorage 或 sessionStorage
  STORAGE_TYPE: 'localStorage'
};

/**
 * 获取存储对象
 * @returns {Storage} 存储对象
 */
function getStorage() {
  return STORAGE_CONFIG.STORAGE_TYPE === 'sessionStorage' 
    ? window.sessionStorage 
    : window.localStorage;
}

/**
 * 保存 token
 * @param {string} token - 认证 token
 */
function setToken(token) {
  if (!token) {
    console.warn('⚠️ 尝试保存空的 token');
    return;
  }
  
  try {
    getStorage().setItem(STORAGE_CONFIG.TOKEN_KEY, token);
    console.log('✅ Token 保存成功');
  } catch (error) {
    console.error('❌ Token 保存失败:', error);
  }
}

/**
 * 获取 token
 * @returns {string|null} 认证 token
 */
function getToken() {
  try {
    return getStorage().getItem(STORAGE_CONFIG.TOKEN_KEY);
  } catch (error) {
    console.error('❌ Token 获取失败:', error);
    return null;
  }
}

/**
 * 移除 token
 */
function removeToken() {
  try {
    getStorage().removeItem(STORAGE_CONFIG.TOKEN_KEY);
    console.log('✅ Token 已清除');
  } catch (error) {
    console.error('❌ Token 清除失败:', error);
  }
}

/**
 * 检查 token 是否存在
 * @returns {boolean} token 是否存在
 */
function hasToken() {
  const token = getToken();
  return !!(token && token.trim());
}

/**
 * 保存用户信息
 * @param {object} user - 用户信息对象
 */
function setUser(user) {
  if (!user) {
    console.warn('⚠️ 尝试保存空的用户信息');
    return;
  }
  
  try {
    getStorage().setItem(STORAGE_CONFIG.USER_KEY, JSON.stringify(user));
    console.log('✅ 用户信息保存成功');
  } catch (error) {
    console.error('❌ 用户信息保存失败:', error);
  }
}

/**
 * 获取用户信息
 * @returns {object|null} 用户信息对象
 */
function getUser() {
  try {
    const userStr = getStorage().getItem(STORAGE_CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('❌ 用户信息获取失败:', error);
    return null;
  }
}

/**
 * 移除用户信息
 */
function removeUser() {
  try {
    getStorage().removeItem(STORAGE_CONFIG.USER_KEY);
    console.log('✅ 用户信息已清除');
  } catch (error) {
    console.error('❌ 用户信息清除失败:', error);
  }
}

/**
 * 登录
 * @param {string} token - 认证 token
 * @param {object} user - 用户信息（可选）
 */
function login(token, user = null) {
  setToken(token);
  if (user) {
    setUser(user);
  }
  console.log('✅ 用户登录成功');
}

/**
 * 登出
 */
function logout() {
  removeToken();
  removeUser();
  console.log('✅ 用户已登出');
  
  // 可以在这里添加登出后的跳转逻辑
  // window.location.href = '/login';
}

/**
 * 检查用户是否已登录
 * @returns {boolean} 是否已登录
 */
function isLoggedIn() {
  return hasToken();
}

/**
 * 获取认证头信息
 * @returns {object} 认证头对象
 */
function getAuthHeaders() {
  const token = getToken();
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    // 或者使用其他格式，如：
    // 'X-Auth-Token': token,
    // 'Token': token
  };
}

/**
 * 请求拦截器 - 自动添加认证头
 * @param {object} config - 请求配置
 * @returns {object} 修改后的请求配置
 */
function requestInterceptor(config) {
  // 添加认证头
  const authHeaders = getAuthHeaders();
  config.headers = {
    ...config.headers,
    ...authHeaders
  };
  
  // 可以在这里添加其他全局请求配置
  // 如：添加时间戳、请求ID等
  
  return config;
}

/**
 * 响应拦截器 - 处理认证相关的响应
 * @param {object} response - 响应对象
 * @returns {object} 处理后的响应对象
 */
function responseInterceptor(response) {
  // 检查是否需要重新登录
  if (response.status === 401 || response.data?.code === 401) {
    console.warn('⚠️ 认证失效，需要重新登录');
    logout();
    // 可以在这里触发重新登录的逻辑
    // 如：跳转到登录页面或显示登录弹窗
  }
  
  return response;
}

// 认证管理接口对象
const AuthManager = {
  // Token 管理
  setToken,
  getToken,
  removeToken,
  hasToken,

  // 用户信息管理
  setUser,
  getUser,
  removeUser,

  // 认证状态管理
  login,
  logout,
  isLoggedIn,

  // 请求相关
  getAuthHeaders,
  requestInterceptor,
  responseInterceptor,

  // 配置
  STORAGE_CONFIG
};

// 初始化全局服务命名空间
if (!window.AmisAppCore) {
  window.AmisAppCore = {};
}

// 注册认证管理器到全局服务
window.AmisAppCore.auth = AuthManager;

// 保持向后兼容
window.AuthManager = AuthManager;

console.log('📦 认证管理模块已加载并注册到 window.AmisAppCore.auth');
