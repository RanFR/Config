# Pi

[Pi](https://github.com/EarendilWorks/pi)（EarendilWorks.pi）AI 编程助手的个人配置。

## 目录结构

```text
Pi/
├── settings.json   # 主设置：模型与思考等级
├── mcp.json        # MCP 服务器配置
├── extensions/     # TypeScript 扩展
├── prompts/        # 提示词模板（斜杠命令）
├── skills/         # 技能
└── .gitignore
```

## 各文件说明

### `settings.json`

主配置文件：

- 默认模型 `glm-5.3`，provider 为 `zai-coding-cn`，思考等级 `max`
- 启用的模型：`glm-5.3`、`glm-5.3-flash`
- 外部编辑器：`code --wait`

### `mcp.json`

MCP 服务器配置，均使用智谱（bigmodel.cn）提供的 MCP 端点，通过 `ZAI_CODING_CN_API_KEY` 环境变量鉴权：

- **web-reader** - 抓取任意 URL 并转为 Markdown
- **web-search-prime** - 实时联网搜索（新闻、股价、天气等）
- **zread** - GitHub 仓库浏览器（zread.ai），检索仓库文档、issue、PR

### `extensions/`

TypeScript 扩展，随 Pi 启动自动加载：

- `ask-user-question.ts` - 自定义 `ask_user_question` 工具的 TUI 交互界面（选项列表、自定义输入、多选提交）
- `shell-timeout.ts` - 强制限制内置 bash/powershell 工具的执行时长：模型未指定 timeout 时注入默认值 300 秒，显式传入也会被钳制到 600 秒以内，防止命令挂起

### `prompts/`

提示词模板，注册为斜杠命令：

- `commit.md` - `/commit`：调用 git-commit 技能，按 Conventional Commits 规范提交当前变更
- `init.md` - `/init`：为当前仓库生成 AGENTS.md 贡献者指南

### `skills/`

- `git-commit/` - Conventional Commits 提交流程技能：分析 diff、智能暂存、生成符合规范的提交信息

## 使用方法

将本目录内容部署到 Pi 的用户配置目录（`~/.pi/agent/`）：

```bash
cp -r Pi/. ~/.pi/agent/
```

使用前需设置环境变量（MCP 服务器鉴权）：

```bash
export ZAI_CODING_CN_API_KEY=<your-key>
```

修改扩展或技能后，重启 Pi 或执行 `/reload` 生效。
