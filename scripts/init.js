#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// GitHub API配置
const GITHUB_API_URL = 'https://api.github.com/repos/baidu/amis/releases/latest';
const USER_AGENT = 'Mozilla/5.0 (compatible; amis-starter-init)';

// History.js 库配置
const HISTORY_JS_URL = 'https://unpkg.com/history@4.10.1/umd/history.js';

/**
 * 发起HTTPS请求
 */
function httpsRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      headers: {
        'User-Agent': USER_AGENT,
        ...options.headers
      }
    }, (res) => {
      let data = '';

      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpsRequest(res.headers.location, options).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * 下载文件
 */
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`正在下载: ${url}`);

    const req = https.request(url, {
      headers: { 'User-Agent': USER_AGENT }
    }, (res) => {
      // 处理重定向
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, filePath).then(resolve).catch(reject);
      }

      if (res.statusCode !== 200) {
        reject(new Error(`下载失败 HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const fileStream = fs.createWriteStream(filePath);
      res.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`下载完成: ${filePath}`);
        resolve();
      });

      fileStream.on('error', reject);
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * 解压tar.gz文件
 */
function extractTarGz(tarPath, extractPath) {
  try {
    console.log(`正在解压: ${tarPath} -> ${extractPath}`);

    // 确保目标目录存在
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }

    // 使用tar命令解压
    execSync(`tar -xzf "${tarPath}" -C "${extractPath}"`, { stdio: 'inherit' });

    console.log(`解压完成: ${extractPath}`);

    // 删除压缩包
    fs.unlinkSync(tarPath);
    console.log(`已删除临时文件: ${tarPath}`);

  } catch (error) {
    throw new Error(`解压失败: ${error.message}`);
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    console.log('🚀 开始初始化amis资源...\n');

    // 1. 获取最新release信息
    console.log('📡 获取最新release信息...');
    const releaseData = await httpsRequest(GITHUB_API_URL);
    const release = JSON.parse(releaseData);

    console.log(`✅ 找到最新版本: ${release.tag_name}\n`);

    // 2. 查找需要的文件
    const assets = release.assets;
    const jsSdkAsset = assets.find(asset => asset.name === 'jssdk.tar.gz');
    const schemaAsset = assets.find(asset => asset.name === 'schema.json');

    if (!jsSdkAsset) {
      throw new Error('未找到 jssdk.tar.gz 文件');
    }

    if (!schemaAsset) {
      throw new Error('未找到 schema.json 文件');
    }

    // 3. 下载jssdk.tar.gz
    console.log('📦 下载jssdk.tar.gz...');
    const jsSdkTarPath = './jssdk.tar.gz';
    await downloadFile(jsSdkAsset.browser_download_url, jsSdkTarPath);

    // 4. 解压到./js/sdk目录
    console.log('📂 解压jssdk到./js/sdk目录...');
    extractTarGz(jsSdkTarPath, './js/sdk');

    // 5. 下载schema.json
    console.log('📄 下载schema.json...');
    await downloadFile(schemaAsset.browser_download_url, './schema.json');

    // 6. 下载history.js库
    console.log('🔄 下载history.js库...');
    await downloadFile(HISTORY_JS_URL, './js/sdk/history.js');

    console.log('\n🎉 初始化完成！');
    console.log('✅ jssdk已解压到: ./js/sdk');
    console.log('✅ schema.json已下载到根目录');
    console.log('✅ history.js已下载到: ./js/sdk');

  } catch (error) {
    console.error('\n❌ 初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}