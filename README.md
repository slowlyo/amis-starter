# Amis Starter

基于 [amis](https://aisuda.bce.baidu.com/amis) 的低代码前端应用快速启动模板。

## ✨ 特性

- 🚀 **零依赖启动** - 使用 Node.js 内置模块实现的轻量 HTTP 服务器
- 📦 **自动初始化** - 一键下载最新版本的 amis SDK 资源
- 🎯 **配置分离** - 页面配置独立存储，便于维护和扩展
- 📱 **响应式设计** - 支持多端适配的管理界面
- 🔧 **开箱即用** - 包含表单、表格等常用组件示例

## 📁 项目结构

```
amis-starter/
├── scripts/           # 脚本目录
│   ├── init.js       # 初始化 amis 资源脚本
│   └── server.js     # 轻量级 HTTP 服务器
├── pages/            # 页面配置目录
│   ├── site.json     # 站点导航配置
│   ├── home.json     # 首页配置
│   ├── form.json     # 表单示例配置
│   └── table.json    # 表格示例配置
├── js/sdk/           # amis SDK 文件（初始化后生成）
├── index.html        # 应用主页面
├── schema.json       # amis 配置文件（初始化后生成）
└── package.json      # 项目配置
```

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd amis-starter
```

### 2. 初始化 amis 资源

```bash
npm run init
```

此命令会：
- 从 GitHub 获取 amis 最新版本信息
- 下载 `jssdk.tar.gz` 并解压到 `./js/sdk` 目录
- 下载 `schema.json` 到项目根目录

### 3. 启动开发服务器

```bash
npm run serve
# 或者
npm run dev
# 或者
npm start
```

### 4. 访问应用

打开浏览器访问：http://localhost:8080

## 📋 可用命令

| 命令 | 说明 |
|------|------|
| `npm run init` | 初始化 amis 资源（下载最新版本的 SDK 和配置文件） |
| `npm run serve` | 启动开发服务器（默认端口 8080） |
| `npm run dev` | 启动开发服务器（serve 的别名） |
| `npm start` | 启动开发服务器（serve 的别名） |

## ⚙️ 配置说明

### 环境变量

- `PORT` - 服务器端口号（默认：8080）

```bash
# 使用自定义端口启动
PORT=3000 npm run serve
```

### 页面配置

所有页面配置都存储在 `pages/` 目录下的 JSON 文件中：

- **site.json** - 定义应用的导航结构和路由
- **home.json** - 首页内容配置
- **form.json** - 表单示例页面配置
- **table.json** - 表格示例页面配置

#### 添加新页面

1. 在 `pages/` 目录下创建新的 JSON 配置文件
2. 在 `pages/site.json` 中添加对应的路由配置

示例：
```json
{
  "label": "新页面",
  "url": "/new-page",
  "icon": "fa fa-star",
  "schemaApi": "/pages/new-page.json"
}
```

## 🛠️ 开发指南

### 自定义页面

1. **创建页面配置文件**

在 `pages/` 目录下创建新的 JSON 文件，例如 `my-page.json`：

```json
{
  "status": 0,
  "msg": "success",
  "data": {
    "type": "page",
    "title": "我的页面",
    "body": [
      {
        "type": "alert",
        "level": "info",
        "body": "这是我的自定义页面"
      }
    ]
  }
}
```

2. **添加路由配置**

在 `pages/site.json` 中添加路由：

```json
{
  "label": "我的页面",
  "url": "/my-page",
  "icon": "fa fa-star",
  "schemaApi": "/pages/my-page.json"
}
```

### 服务器配置

内置的轻量级服务器支持：

- ✅ 静态文件服务
- ✅ CORS 跨域支持
- ✅ SPA 路由支持
- ✅ 安全路径检查
- ✅ 自定义端口配置
- ✅ 优雅的错误处理

## 📚 相关资源

- [amis 官方文档](https://aisuda.bce.baidu.com/amis/zh-CN/docs/index)
- [amis 组件库](https://aisuda.bce.baidu.com/amis/zh-CN/components/page)
- [amis GitHub](https://github.com/baidu/amis)
- [amis 示例](https://aisuda.bce.baidu.com/amis/examples/index)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔧 故障排除

### 常见问题

**Q: 运行 `npm run init` 时网络连接失败？**

A: 请检查网络连接，或尝试使用代理。init 脚本会从 GitHub 下载资源。

**Q: 页面显示空白或加载失败？**

A: 请确保已运行 `npm run init` 初始化 amis 资源文件。

**Q: 端口被占用？**

A: 使用环境变量指定其他端口：`PORT=3000 npm run serve`

**Q: 如何自定义主题？**

A: 可以修改 `index.html` 中的 theme 配置，支持 `default`、`cxd`、`dark` 等主题。

---

**Happy Coding! 🎉**
