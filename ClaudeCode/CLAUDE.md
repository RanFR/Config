# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在处理此仓库中的代码时提供指导。

## 项目概述

这是出色的 Claude 代理仓库 - 一个专业化 AI 代理集合，通过智能编排和领域专业知识扩展 Claude Code 的功能。这些代理作为一个开发团队协同工作，每个代理都拥有特定的专业知识和委派模式。

## 与代理合作

当创建或修改代理时：

1. 代理是带有 YAML 前置元数据的 Markdown 文件
2. 大多数代理应省略 `tools` 字段以继承所有可用工具
3. 在描述中使用 XML 风格的示例以便智能调用
4. 代理返回结构化的发现供主代理协调

## Claude Code 的编排模式

由于 Claude Code 中的子代理不能直接调用其他子代理，因此编排遵循以下严格的模式：

### 关键：代理路由协议

**当处理复杂任务时，你必须：**

1. **始终从 tech-lead-orchestrator 开始**任何多步骤任务
2. **精确遵循**技术负责人返回的**代理路由图**
3. **仅使用**技术负责人**明确推荐的代理**
4. **绝不独立选择代理** - 技术负责人知道哪些代理存在

### 示例：使用代理路由构建功能

```text
用户："构建一个用户管理系统"

主 Claude 代理：
1. 首先，我将使用 tech-lead-orchestrator 分析并获取路由
   → 技术负责人返回带有特定代理的代理路由图

2. 我必须仅使用路由图中列出的代理：
   - 如果技术负责人说"使用 django-api-developer" → 使用那个确切的代理
   - 如果技术负责人说"使用 react-component-architect" → 使用那个确切的代理
   - 不要替换为通用代理，除非指定为后备选项

3. 使用 TodoWrite 按技术负责人指定的顺序执行任务
```

### 关键编排规则

1. **技术负责人是路由权威**：技术负责人决定哪些代理可以处理每个任务
2. **严格代理选择**：仅使用技术负责人"可用代理"列表中的代理
3. **禁止即兴发挥**：不要基于自己的判断选择代理
4. **深度推理**：在协调推荐代理时应用仔细思考
5. **结构化交接**：在代理调用之间提取和传递信息

### 代理选择流程

```text
正确流程：
用户请求 → 技术负责人分析 → 代理路由图 → 使用列出的代理执行

错误流程：
用户请求 → 主代理猜测 → 选择错误的代理 → 任务失败
```

### 你必须遵循的技术负责人响应示例

当技术负责人返回时：

```text
## 本项目可用代理
- django-backend-expert: Django 任务
- django-api-developer: API 任务
- react-component-architect: React UI
```

你必须使用这些特定代理，而不是像"backend-developer"这样的通用替代方案

## 高级架构

### 代理组织

项目遵循分层结构：

1. **编排器** (`agents/orchestrators/`)

   - `tech-lead-orchestrator`: 通过三阶段工作流（研究 → 规划 → 执行）协调复杂项目
   - `project-analyst`: 检测技术栈并启用智能路由
   - `team-configurator`: 在 CLAUDE.md 文件中创建代理路由规则

2. **核心代理** (`agents/core/`)

   - 跨领域关注点，如代码考古、审查、性能和文档
   - 这些代理支持所有技术栈

3. **通用代理** (`agents/universal/`)

   - 框架无关的专家（API、后端、前端、Tailwind）
   - 当不存在框架特定代理时的后备选项

4. **专业代理** (`agents/specialized/`)
   - 按技术组织的框架特定专家
   - 子目录：laravel/、django/、rails/、react/、vue/

### 三阶段编排工作流（主代理协调）

主 Claude 代理使用技术负责人编排器实现人在环工作流：

1. **研究阶段**：技术负责人分析需求并返回结构化发现
2. **批准门**：主代理呈现发现并等待人类批准
3. **规划阶段**：主代理基于技术负责人的推荐使用 TodoWrite 创建任务
4. **执行阶段**：主代理使用过滤的上下文顺序调用专家

### 代理通信协议

由于子代理不能直接通信或调用彼此：

- **结构化返回**：每个代理以可解析格式返回发现
- **上下文传递**：主代理从返回中提取相关信息
- **顺序协调**：主代理管理执行流程
- **交接信息**：代理在返回中包含下一个专家需要的内容

返回格式示例：

```sql
## 任务完成：API 设计
- 定义的端点：GET/POST/PUT/DELETE /api/users
- 认证：需要 Bearer token
- 下一个专家需要：此 API 规范用于实现
```

### 智能路由

系统基于以下内容自动路由任务：

1. 项目上下文（由项目分析器检测）
2. 适用的框架特定路由
3. 未知栈的通用后备
4. 任务需求和代理专业知识

## 关键概念

### 代理定义格式

```yaml
---
name: agent-name
description: |
  带有 XML 示例的专业描述
  Examples:
  - <example>
    Context: 何时使用
    user: "请求"
    assistant: "我将使用 agent-name"
    <commentary>为什么选择</commentary>
  </example>

# tools: 省略以使用所有工具，指定用于限制
---
# 代理名称
系统提示内容...
```

### 歧义检测

- 项目分析器标记分析中的不确定性
- 技术负责人在执行前呈现研究发现以供批准
- 代理应识别需要澄清的假设

### 工具继承

- 省略 `tools` 字段 = 继承所有工具（推荐）
- 仅为安全限制指定工具
- 在可用时包括 WebFetch、MCP 工具

## 开发指南

1. **创建新代理**：

   - 使用 templates/agent-template.md 作为起点
   - 专注于单一领域专业知识
   - 包括 2-3 个 XML 示例
   - 定义结构化返回格式

2. **代理返回模式**：

   - 始终以结构化格式返回发现
   - 包括"下一步骤"或"交接信息"
   - 指定下一个专家需要什么上下文
   - 主代理将解析和协调

3. **测试代理**：
   - 测试调用模式
   - 验证委派工作正常
   - 确保输出质量

## 重要文件和模式

- `docs/orchestration-patterns.md`: 详细的三阶段工作流文档
- `docs/creating-agents.md`: 创建新代理的指南
- `docs/best-practices.md`: 代理开发最佳实践
- `examples/`: 真实世界的使用示例
- 所有代理通过技术负责人的批准门支持人在环

## 完整编排示例

这是一个显示正确代理路由的完整示例：

### 用户请求：

"帮助我为我的网络应用构建一个认证系统"

### 步骤 1：技术负责人分析

```text
主代理："我将使用 tech-lead-orchestrator 分析此请求并确定最佳方法。"

[调用 tech-lead-orchestrator]
```

### 步骤 2：技术负责人返回路由图

```text
## 代理路由图

任务 1：检测项目技术
- 主要代理：project-analyst
- 原因：需要识别框架以进行正确路由

任务 2：设计认证架构
- 主要代理：database-architect
- 原因：框架无关的数据库设计

任务 3：实现认证后端
- 主要代理：django-backend-expert
- 后备代理：backend-developer
- 原因：项目中检测到 Django

任务 4：创建认证 API 端点
- 主要代理：django-api-developer
- 后备代理：api-architect
- 原因：Django REST Framework 模式

## 本项目可用代理
- project-analyst
- database-architect
- django-backend-expert
- django-api-developer
- code-reviewer

## 关键指令
仅使用上面列出的代理。不要使用 laravel、rails 或其他框架代理。
```

### 步骤 3：主代理执行计划

```text
主代理："基于技术负责人的路由，我现在将协调实现："

1. ✓ 使用 project-analyst 分析代码库
2. ✓ 使用 database-architect 进行认证架构设计
3. ✓ 使用 django-backend-expert 进行实现
4. ✓ 使用 django-api-developer 进行 API 端点
5. ✓ 使用 code-reviewer 进行安全审计

[使用指定的确切代理执行每个步骤]
```

### 不应做什么：

```text
❌ "我将使用 backend-developer"（当技术负责人指定了 django-backend-expert）
❌ "我将使用 rails-api-developer"（错误的框架）
❌ "我将跳过技术负责人自己选择代理"（绕过路由）
```

## 关键提醒

- 对于多步骤任务，始终使用 tech-lead-orchestrator 以获得正确的代理路由
- 精确遵循代理路由图 - 不要即兴发挥
- 在协调推荐代理时使用深度推理
- 信任技术负责人在代理选择中的专业知识
