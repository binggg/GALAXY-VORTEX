# 🎰 银河抽奖系统

一个基于 React + Three.js + 腾讯云开发的 3D 银河主题抽奖应用，支持阶梯奖品配置、批量抽奖和云端数据同步。

[![Powered by CloudBase](https://7463-tcb-advanced-a656fc-1257967285.tcb.qcloud.la/mcp/powered-by-cloudbase-badge.svg)](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit)

> 本项目基于 [**CloudBase AI ToolKit**](https://github.com/TencentCloudBase/CloudBase-AI-ToolKit) 开发


https://github.com/user-attachments/assets/6c953f44-fb2b-45cb-b481-99b0f9409cdf




## ✨ 功能特点

- 🌌 **3D 银河视觉效果** - 基于 Three.js 的沉浸式抽奖体验
- 🎯 **阶梯奖品系统** - 支持三等奖、二等奖、一等奖分级抽取
- 👥 **批量抽奖** - 每个奖项一次性抽取所有名额
- 📷 **动态相机** - 抽奖时相机拉远、环绕、拉近的电影级动效
- ☁️ **云端同步** - 基于腾讯云开发数据库，支持数据持久化
- 🎨 **可配置** - 自定义参与者名单、奖品名称和数量

## 🎮 默认配置

- **参与者**: 20 个宝可梦角色（皮卡丘、小火龙、杰尼龟等）
- **奖品设置**:
  - 三等奖：5 个名额（铜色）
  - 二等奖：3 个名额（银色）
  - 一等奖：1 个名额（金色）

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| 3D 渲染 | Three.js + React Three Fiber |
| 样式 | Tailwind CSS |
| 构建工具 | Vite |
| 后端服务 | 腾讯云开发 CloudBase |
| 数据库 | CloudBase NoSQL |

## 📁 项目结构

```
src/
├── components/
│   ├── GalaxyScene.tsx    # 3D 银河场景（粒子系统、相机动效）
│   ├── ControlPanel.tsx   # 控制面板（参与者管理、奖品配置）
│   ├── WinnerModal.tsx    # 中奖弹窗
│   └── Header.tsx         # 页面头部
├── hooks/
│   └── useLotteryDB.ts    # 云开发数据库 Hook
├── pages/
│   └── LotteryPage.tsx    # 抽奖主页面
├── lib/
│   └── cloudbase.ts       # 云开发初始化
└── types/
    └── index.ts           # TypeScript 类型定义
```

## ☁️ 云开发资源

本项目使用以下 CloudBase 数据库集合：

| 集合名 | 用途 |
|--------|------|
| `lottery_activities` | 抽奖活动配置 |
| `lottery_participants` | 参与者列表 |
| `lottery_winners` | 中奖记录 |

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置云开发环境

修改 `src/lib/cloudbase.ts` 中的环境 ID：

```typescript
const ENV_ID = 'your-env-id';
```

### 3. 本地开发

```bash
npm run dev
```

### 4. 构建部署

```bash
npm run build
# 使用云开发 CLI 或控制台上传 dist 目录到静态托管
```

---

## 📝 AI 开发提示词

### 🚀 一句话版本（懒人专用）

```
做一个 3D 银河抽奖应用：深空背景 + 圆形渐变粒子星系，暗色科技风 UI 配金银铜三色。功能要有三/二/一等奖阶梯批量抽取，抽奖时相机拉远→环绕旋转→拉近的电影动效。侧边栏可收起，奖品可配置，默认用 20 个宝可梦角色。集成云开发数据库存储抽奖记录。技术栈 React + Three.js + TypeScript + Tailwind。
```

---

### 📋 分步版本（可复现）

按顺序输入以下 3 个提示词：

**Prompt 1: 核心功能**

```
创建一个 3D 银河主题抽奖应用：

视觉设计：
- 深空背景，银河粒子系统（圆形渐变光点，非方块）
- 参与者名字环绕银河中心分布
- 科技感 UI，暗色主题配金/银/铜色点缀

功能需求：
- 阶梯奖品系统：三等奖 5 人、二等奖 3 人、一等奖 1 人
- 批量抽奖：每个奖项一次性抽完所有名额，从低到高依次抽取
- 抽奖动效：相机先拉远，然后环绕旋转，最后拉近展示中奖者
- 默认参与者用宝可梦角色（皮卡丘、小火龙等 20 个）

技术栈：React + Three.js + TypeScript + Tailwind CSS
```

**Prompt 2: 交互优化**

```
优化交互体验：
- 侧边栏可收起/展开，收起后显示菜单图标按钮
- 中奖弹窗点击任意位置可关闭并进入下一轮
- 奖品名称和数量可配置
- 中奖记录按奖项分组展示
```

**Prompt 3: 云开发集成**

```
集成腾讯云开发数据库：
- 创建 lottery_activities、lottery_participants、lottery_winners 三个集合
- 支持保存抽奖状态到云端
- 支持从云端恢复抽奖进度
- 中奖记录自动同步
```

---

## 🎯 开发要点总结

1. **3D 粒子效果**: 使用 Canvas 生成圆形渐变纹理，避免默认方形点
2. **动画缓动**: 使用 ease-in-out 曲线，控制旋转速度变化
3. **相机控制**: 分阶段控制相机位置，创造电影感
4. **状态管理**: 使用 ref 防止重复处理，确保奖项正确流转
5. **云开发集成**: 使用 `@cloudbase/js-sdk` 实现数据持久化

## 📄 许可证

MIT
