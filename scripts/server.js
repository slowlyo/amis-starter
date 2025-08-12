#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 配置
const DEFAULT_PORT = 8080;
const ROOT_DIR = path.resolve(__dirname, '..');

// MIME类型映射
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

/**
 * 获取文件MIME类型
 */
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * 发送文件响应
 */
function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(`❌ 读取文件失败: ${filePath}`, err.message);
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('服务器内部错误');
      return;
    }
    
    const mimeType = getMimeType(filePath);
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(data);
  });
}

/**
 * 发送404响应
 */
function send404(res, requestPath) {
  console.log(`❌ 404: ${requestPath}`);
  res.writeHead(404, { 
    'Content-Type': 'text/html; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>404 - 页面未找到</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        h1 { color: #e74c3c; }
        p { color: #666; }
      </style>
    </head>
    <body>
      <h1>404 - 页面未找到</h1>
      <p>请求的路径 <code>${requestPath}</code> 不存在</p>
      <p><a href="/">返回首页</a></p>
    </body>
    </html>
  `);
}

/**
 * 处理请求
 */
function handleRequest(req, res) {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // 安全检查：防止路径遍历攻击
  if (pathname.includes('..')) {
    console.log(`🚫 拒绝危险路径: ${pathname}`);
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('禁止访问');
    return;
  }
  
  // 默认首页
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  const filePath = path.join(ROOT_DIR, pathname);
  
  // 检查文件是否存在
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA支持：如果是HTML请求且文件不存在，返回index.html
      if (pathname.endsWith('.html') || !path.extname(pathname)) {
        const indexPath = path.join(ROOT_DIR, 'index.html');
        fs.stat(indexPath, (indexErr) => {
          if (indexErr) {
            send404(res, pathname);
          } else {
            console.log(`📄 SPA路由: ${pathname} -> /index.html`);
            sendFile(res, indexPath);
          }
        });
      } else {
        send404(res, pathname);
      }
      return;
    }
    
    console.log(`✅ ${req.method} ${pathname}`);
    sendFile(res, filePath);
  });
}

/**
 * 启动服务器
 */
function startServer() {
  const port = process.env.PORT || DEFAULT_PORT;
  
  const server = http.createServer(handleRequest);
  
  server.listen(port, () => {
    console.log('🚀 静态文件服务器启动成功！');
    console.log(`📂 根目录: ${ROOT_DIR}`);
    console.log(`🌐 访问地址: http://localhost:${port}`);
    console.log('按 Ctrl+C 停止服务器\n');
  });
  
  // 优雅关闭
  process.on('SIGINT', () => {
    console.log('\n👋 正在关闭服务器...');
    server.close(() => {
      console.log('✅ 服务器已关闭');
      process.exit(0);
    });
  });
  
  // 错误处理
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ 端口 ${port} 已被占用，请尝试其他端口`);
      console.error(`   可以设置环境变量: PORT=3000 node scripts/server.js`);
    } else {
      console.error('❌ 服务器错误:', err.message);
    }
    process.exit(1);
  });
}

// 运行服务器
if (require.main === module) {
  startServer();
}

module.exports = { startServer };
