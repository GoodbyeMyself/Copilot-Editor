# 共享聊天组件

这个目录包含了从 Helper 和 Copilot 模块中抽取的公共聊天相关组件和工具。

## 架构设计

### 核心原则
- **以 Copilot 为主**：基于 Copilot 组件的设计模式，确保功能完整性
- **高度可配置**：通过 props 支持不同模块的定制化需求
- **类型安全**：完整的 TypeScript 类型定义
- **逻辑复用**：抽取公共业务逻辑，避免代码重复

### 文件结构
```
src/components/shared/chat/
├── types.ts                    # 类型定义
├── utils.ts                    # 工具函数
├── hooks/
│   └── useThinkTiming.ts      # 思考时间管理 Hook
├── components/
│   ├── BaseChatList.tsx       # 基础聊天列表组件
│   ├── BaseChatSender.tsx     # 基础聊天发送器组件
│   └── BaseSenderHeader.tsx   # 基础发送器头部组件
├── index.ts                   # 统一导出
└── README.md                  # 说明文档
```

## 组件说明

### BaseChatList
基础聊天列表组件，支持：
- 消息渲染和状态管理
- 思考过程解析和展示
- 思考时间计算
- 可配置的样式和布局
- 空状态展示

**主要特性：**
- 自动解析 `<think>` 标签内容
- 实时计算思考用时
- 支持取消标记显示
- 可配置的欢迎页面和提示词

### BaseChatSender
基础聊天发送器组件，支持：
- 文本输入和发送
- 语音输入
- 文件上传
- 建议词功能
- 加载状态管理

**主要特性：**
- 支持 Suggestion 建议词
- 可配置的头部组件
- 文件拖拽上传
- 语音输入支持

### BaseSenderHeader
基础发送器头部组件，支持：
- 文件上传管理
- 拖拽上传
- 文件列表展示

## 工具函数

### parseThinkContent
解析包含 `<think>` 标签的消息内容，返回思考内容和剩余内容。

### useThinkTiming
管理消息思考时间的 Hook，提供：
- 记录思考开始时间
- 计算思考用时
- 清理时间记录

## 使用示例

### 在 Copilot 中使用
```tsx
import { BaseChatList } from '../../../components/shared/chat';

<BaseChatList
    messages={messages}
    onUserSubmit={onSubmit}
    containerClassName="copilot-chat-list"
    messageClassName="copilot-message-content"
    loadingMessageClassName="copilot-loading-message"
    // ... 其他配置
/>
```

### 在 Helper 中使用
```tsx
import { BaseChatList } from '../../../components/shared/chat';

<BaseChatList
    messages={messages}
    onUserSubmit={onUserSubmit}
    containerClassName="helper-chat-list"
    messageClassName="helper-message-content"
    // ... 其他配置
/>
```

## 重构收益

### 代码复用
- 消除了 Helper 和 Copilot 之间的重复代码
- 统一的思考过程解析逻辑
- 共享的时间管理机制

### 维护性
- 单一职责原则，每个组件功能明确
- 统一的类型定义，减少类型错误
- 集中的工具函数，便于测试和维护

### 扩展性
- 通过 props 配置支持不同需求
- 模块化设计，易于添加新功能
- 清晰的接口定义，便于集成

## 注意事项

1. **样式隔离**：通过 className props 确保不同模块的样式不冲突
2. **类型安全**：使用严格的 TypeScript 类型定义
3. **向后兼容**：保持原有组件的接口不变
4. **性能优化**：使用 React.memo 和 useCallback 优化渲染性能