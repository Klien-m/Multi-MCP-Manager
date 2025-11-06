# Multi-MCP-Manager

一个基于 Tauri 和 React 的桌面应用程序，用于管理多个 AI 编程工具的 Model Context Protocol (MCP) 配置。

## 🚀 功能特性

### 核心功能
- **多工具支持**: 支持管理 Cursor、Claude Code、Kilo Code 等多种 AI 编程工具的 MCP 配置
- **配置管理**: 创建、编辑、删除和启用/禁用 MCP 配置
- **批量操作**: 支持配置的导入、导出和复制功能
- **智能搜索**: 快速搜索和过滤配置
- **本地扫描**: 自动扫描本地 AI 工具的配置文件并转换为统一格式

### 技术亮点
- **跨平台桌面应用**: 基于 Tauri 框架，支持 Windows、macOS 和 Linux
- **现代化 UI**: 使用 React 19 + Tailwind CSS + Radix UI 组件库
- **状态管理**: 使用 Zustand 进行高效的状态管理
- **类型安全**: 完整的 TypeScript 支持
- **文件操作**: 直接读写本地配置文件

## 📋 系统要求

- Node.js 18+
- Rust (用于 Tauri 编译)
- 支持的平台: macOS 10.15+

## 🛠️ 安装和运行

### 开发环境

```bash
# 克隆项目
git clone <repository-url>
cd multi-mcp-manager

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建桌面应用
pnpm build
pnpm tauri build
```

### 生产环境

下载并安装预编译的桌面应用程序包：
- macOS: `.dmg` 或 `.pkg` 安装包

## 📖 使用指南

### 1. 添加 AI 工具

首次使用需要先添加要管理的 AI 工具：

1. 点击右上角的"管理工具"按钮
2. 添加工具名称、图标和配置文件路径
3. 支持的工具包括 Cursor、Claude Code、Kilo Code 等

### 2. 创建 MCP 配置

1. 选择目标工具
2. 点击"新建配置"按钮
3. 填写配置名称和 MCP 配置内容
4. 保存配置并选择是否启用

### 3. 管理配置

- **启用/禁用**: 点击配置卡片的开关按钮
- **编辑**: 点击编辑按钮修改配置内容
- **删除**: 点击删除按钮移除配置
- **复制**: 将一个配置复制到另一个工具

### 4. 导入导出

- **导出**: 将配置导出为 JSON 文件
- **导入**: 从 JSON 文件导入配置数据
- 支持全量导出和单工具导出

### 5. 本地扫描

使用内置的扫描工具自动发现本地 AI 工具的配置文件：

1. 点击"AI 扫描"按钮
2. 选择要扫描的工具类型
3. 扫描完成后查看发现的配置
4. 选择要导入的配置并转换为统一格式

## ⚠️ 已知问题

- [ ] 扫描配置保存后页面未自动刷新（疑难问题）

## 📋 开发计划

### 当前开发重点

- [ ] MCP 编辑后同步到对应的工具
- [ ] 支持自定义 AI 工具及目录扫描

### 功能 roadmap

- **短期目标 (1-2 个月)**
  - [ ] 修复配置保存后页面刷新问题
  - [ ] 完成 MCP 编辑自动同步功能

  - [ ] 支持自定义 AI 工具配置
  - [ ] 增强目录扫描功能

- **长期目标 (6-12 个月)**
  - [ ] 学习 React 和 Rust 技术栈，对整个项目进行深度优化

## 🗂️ 项目结构

```
multi-mcp-manager/
├── src/
│   ├── components/          # React 组件
│   │   ├── ConfigCard.tsx   # 配置卡片组件
│   │   ├── ConfigEditor.tsx # 配置编辑器
│   │   ├── ToolManager.tsx  # 工具管理器
│   │   └── ToolScanToolbar.tsx # 扫描工具栏
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useMCPManager.ts # MCP 管理核心逻辑
│   │   └── useLocalToolScanner.ts # 本地工具扫描
│   ├── services/           # 业务服务
│   │   ├── MCPConfigService.ts # 配置服务
│   │   └── LocalToolScannerService.ts # 本地扫描服务
│   ├── types/              # TypeScript 类型定义
│   └── data/               # 静态数据
│       └── default-configs.ts # 默认配置
├── src-tauri/             # Tauri 原生代码
│   ├── src/
│   │   ├── lib.rs         # Tauri 应用配置
│   │   └── main.rs        # 主函数
│   └── Cargo.toml         # Rust 依赖配置
└── package.json           # Node.js 依赖配置
```

## 🔧 开发指南

### 添加新工具支持

1. 在 `src/data/default-configs.ts` 中添加工具定义
2. 在 `EXTENDED_TOOL_SCAN_CONFIGS` 中配置扫描路径
3. 更新 `src/types/index.ts` 中的类型定义

### 添加新功能

1. 创建新的 React 组件在 `src/components/` 目录
2. 添加相应的 Hook 在 `src/hooks/` 目录
3. 如果需要原生功能，在 `src-tauri/src/commands/` 添加 Rust 函数
4. 更新 `src-tauri/tauri.conf.json` 添加新的 API 权限

### 测试

```bash
# 运行单元测试
pnpm test

# 运行 E2E 测试
pnpm test:e2e

# 代码检查
pnpm lint

# 代码格式化
pnpm format
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Tauri](https://tauri.app/) - 跨平台桌面应用框架
- [React](https://reactjs.org/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无样式的组件库
- [Zustand](https://zustand-demo.pmnd.rs/) - 轻量级状态管理

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue: [GitHub Issues](https://github.com/Klien-m/Multi-MCP-Manager/issues)

---

**Multi-MCP-Manager** - 让 MCP 配置管理更简单 🚀