# Config

<div align="center">

**个人开发环境配置文件集合**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)](https://git-scm.com/)
[![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=flat&logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)

包含终端、编辑器、AI 编程工具和输入法的完整配置方案

</div>

## 📋 目录

- [🌟 项目特色](#-项目特色)
- [📁 目录结构](#-目录结构)
- [🚀 快速开始](#-快速开始)
- [📖 详细配置](#-详细配置)
- [🔧 自定义配置](#-自定义配置)
- [🤝 贡献指南](#-贡献指南)
- [📄 许可证](#-许可证)

## 🌟 项目特色

- **🤖 AI 编程**: 基于 OpenCode 的多智能体配置，按任务自动分派模型
- **⚡ 高效开发**: 预配置的开发环境，开箱即用
- **🧩 模块化**: Bash 配置按数字前缀分层加载，职责清晰、易于增删
- **🌐 网络优化**: 代理开关函数与 Clash 规则转换脚本
- **⌨️ 输入法**: Rime 输入法个人覆写配置

## 📁 目录结构

### 🖥️ [Bash](./Bash/)

Bash 终端配置，采用数字前缀分层模块结构

```text
Bash/
├── .profile      # 登录 shell 配置
├── bashrc        # 交互式 shell 主入口，按序加载模块
└── bash/         # 分层模块（按字典序自动加载）
    ├── 00-env          # 环境变量
    ├── 10-path         # PATH 管理（path_add）
    ├── 20-toolchain    # 工具链配置
    ├── 30-alias        # 命令别名
    ├── 40-function     # 自定义函数
    ├── 50-completion   # 命令补全
    └── 60-prompt       # 提示符
```

> **⚠️ 注意**: 配置文件需要 [Nerd Fonts](https://www.nerdfonts.com/) 字体以获得正确显示效果。

### 🌐 [Clash](./Clash/)

网络代理配置文件

**核心文件**:

- `Script.js` - 规则转换脚本
- `Debug.js` - 调试和分析工具
- `log_analyzer/` - 日志分析工具

详细配置说明见 [Clash/README.md](./Clash/README.md)

### 🌍 [KissTranslator](./KissTranslator/)

Kiss Translator 浏览器翻译插件的自定义翻译接口

- `baidu.js` - 百度翻译 API 接口，内置自研 MD5 签名实现，
  兼容 Firefox 中 sval 沙盒的函数限制，并将常见错误码转为中文提示
- 密钥填写格式：`appid#key`

### ⚡ [Lazygit](./Lazygit/)

Lazygit 终端 Git 工具配置

- `config.yaml` - 键位绑定优化（如 Ctrl+s 确认提交）

### 🤖 [OpenCode](./OpenCode/)

[OpenCode](https://opencode.ai) AI 编程助手配置

**主要组件**:

- `opencode.json` - agent、provider 与 MCP 配置
- `prompts/` - 自定义提示词（build、explore、plan、summary 等）
- `skills/` - 自定义技能（如 git-commit 提交助手）
- `tui.json` - 终端 UI 配置
- `AGENTS.md` - 仓库级代理指引

### 💪 [PowerShell](./PowerShell/)

PowerShell 7 配置文件

- `profile.ps1` - 提供 `proxyon` / `proxyoff` 代理开关函数等

### 🚁 [PX4](./PX4/)

[PX4-Autopilot](https://github.com/PX4/PX4-Autopilot) 无人机仿真环境

> **✅ 测试版本**: PX4 v1.12.3

运行环境初始化脚本（自动配置 `ROS_PACKAGE_PATH`、Gazebo 路径等）：

```bash
source setup_px4_autopilot.sh
```

### 🤖 [Pi](./Pi/)

[Pi](https://github.com/EarendilWorks/pi) AI 编程助手配置

- `settings.json` - 模型与思考等级设置（glm-5.3）
- `mcp.json` - MCP 服务器（联网搜索、网页读取、GitHub 仓库浏览）
- `extensions/` - TypeScript 扩展（TUI 交互、shell 超时限制）
- `prompts/` - 斜杠命令模板（`/commit`、`/init`）
- `skills/` - 技能（git-commit 提交流程）

详见 [Pi/README.md](./Pi/README.md)

### ⌨️ [Rime](./Rime/)

[Rime-Ice](https://github.com/iDvel/rime-ice) 输入法覆写配置

- 候选词数量、中英文切换键位（Control+Space）等个人偏好

### 🛠️ [Terminal](./Terminal/)

终端工具配置集合

- **Windows Terminal** - `settings.json` 配置与主题

### 💻 [VSCode](./VSCode/)

Visual Studio Code 编辑器配置

- `settings.json` - 精简的编辑器、格式化与语言配置

## 🚀 快速开始

### 1️⃣ 克隆仓库

```bash
git clone https://github.com/RanFR/Config.git
cd Config
```

### 2️⃣ 备份现有配置（可选）

```bash
# 备份 Bash 配置
cp ~/.bashrc ~/.bashrc.backup
[ -d ~/.bash ] && cp -r ~/.bash ~/.bash.backup

# 备份 VSCode 配置
cp ~/.config/Code/User/settings.json ~/.config/Code/User/settings.json.backup
```

### 3️⃣ 安装配置文件

#### Bash 环境配置

```bash
cp Bash/bashrc ~/.bashrc
cp -r Bash/bash ~/.bash

# 重新加载配置
source ~/.bashrc
```

#### VSCode 配置

```bash
cp VSCode/settings.json ~/.config/Code/User/
```

#### OpenCode 配置

```bash
# 复制并重命名为 opencode
cp -r OpenCode ~/.config/opencode

# 设置所需环境变量（MCP 服务器用于联网搜索/读取）
export ZHIPU_API_KEY=<your-key>
```

#### PowerShell 配置（Windows）

```powershell
# 将 profile.ps1 内容合并到 $PROFILE 指向的文件
Copy-Item PowerShell/profile.ps1 $PROFILE -Force
```

#### Rime 配置

将 `Rime/default.custom.yaml` 放入 Rime 用户目录后重新部署。

### 4️⃣ 安装必要依赖

Bash 提示符与终端图标需要 [Nerd Fonts](https://www.nerdfonts.com/) 字体；其他工具（git、lazygit 等）请参考各自官方文档安装。

## 📖 详细配置

### OpenCode 多智能体

OpenCode 配置将不同任务分派给合适的模型：

- **build / plan** - 主力模型（glm-5.1）
- **explore / scout** - 探索与检索（glm-4.7）
- **summary / title / compaction** - 轻量任务（glm-4.5-air）

默认 agent 为 `build`，provider 包括 `deepseek` 与 `zhipuai-coding-plan`。

### Clash 代理配置

详细的 Clash 配置说明请参考 [Clash/README.md](./Clash/README.md)

### Bash 模块加载

`bashrc` 按数字前缀顺序加载 `bash/` 中的模块：环境变量 → PATH → 工具链 → 别名 → 函数 → 补全 → 提示符。
新增配置时按职责放入对应模块，详见 [Bash/README.md](./Bash/README.md)

## 🔧 自定义配置

### 添加个人配置

```bash
# 在 Bash 中添加个人别名
echo "alias myproject='cd /path/to/my/project'" >> ~/.bash/30-alias

# 在 VSCode 中添加个人设置
echo '  "editor.fontSize": 16,' >> ~/.config/Code/User/settings.json
```

### 配置同步

```bash
cat > sync_config.sh << 'EOF'
#!/bin/bash
# 同步配置到新机器的脚本

CONFIG_DIR="$HOME/Config"

# 同步配置文件
cp "$CONFIG_DIR/Bash/bashrc" ~/.bashrc
cp -r "$CONFIG_DIR/Bash/bash" ~/.bash
cp "$CONFIG_DIR/VSCode/settings.json" ~/.config/Code/User/
cp -r "$CONFIG_DIR/OpenCode" ~/.config/opencode

echo "配置同步完成！"
EOF

chmod +x sync_config.sh
```

## 🤝 贡献指南

欢迎为项目做出贡献！

### 贡献方式

1. **🐛 报告问题**: 在 Issues 中报告 bug 或提出建议
2. **💻 提交代码**: Fork 项目并提交 Pull Request
3. **📖 改进文档**: 帮助完善文档和说明

### 提交规范

- 使用清晰的提交信息（Conventional Commits 格式）
- 遵循现有的代码风格
- 添加必要的文档说明
- 确保配置文件可正常工作

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by [RanFR](https://github.com/RanFR)

</div>
