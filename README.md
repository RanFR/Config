# Config

<div align="center">

**个人开发环境配置文件集合**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)](https://git-scm.com/)
[![VSCode](https://img.shields.io/badge/VSCode-007ACC?style=flat&logo=visualstudiocode&logoColor=white)](https://code.visualstudio.com/)

包含终端、编辑器、代理工具和开发工具的完整配置方案

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

- **🤖 AI 驱动**: 集成 Claude Code AI 编程助手，包含专业化代理系统
- **⚡ 高效开发**: 预配置的开发环境，开箱即用
- **🎨 美观界面**: 精心设计的终端和编辑器主题
- **🌐 网络优化**: 智能代理配置，支持全球网络访问
- **🔧 模块化**: 模块化设计，按需使用各组件

## 📁 目录结构

### 🖥️ [Bash](./Bash/)

Bash 终端配置文件

> **⚠️ 注意**: 配置文件需要 [Nerd Fonts](https://www.nerdfonts.com/) 字体以获得正确显示效果。

**文件说明**:

- `.bashrc` - Bash 主配置文件，包含别名、函数和环境变量
- `.bash_aliases` - 命令别名配置
- `.bash_profile` - 登录 Shell 配置
- `.bash_function` - 自定义的 Bash 函数

### 🌐 [Clash](./Clash/)

网络代理配置文件

**主要功能**:

- 🔄 自动规则转换和优化
- 🐛 内置调试工具
- 📊 详细日志记录
- 🌍 全球节点智能选择

**核心文件**:

- `Script.js` - 规则转换脚本
- `Debug.js` - 调试和分析工具
- `README.md` - 详细配置说明

**调试设置**:

```javascript
// 在 Script.js 中添加以启用调试
module.exports = { main };
```

### 🤖 [ClaudeCode](./ClaudeCode/)

**Claude Code** AI 编程助手配置和代理系统

#### 🎯 核心功能

- **🧠 专业化代理**: C++、Python、Web 开发等领域专家代理
- **🎭 智能编排**: 通过 tech-lead-orchestrator 实现任务自动路由
- **🛠️ 技能系统**: 可扩展的技能工具集（代码审查、PR 创建、提交助手等）
- **🌏 完整中文化**: 中文界面和文档

#### 📦 主要组件

```text
ClaudeCode/
├── CLAUDE.md          # 系统配置和使用指南
├── agents/            # 专业化代理集合
│   ├── core/         # 核心代理（代码审查、性能优化等）
│   ├── universal/    # 通用代理（后端、前端、API 等）
│   └── specialized/  # 专业代理（C++、Python 专家等）
├── skills/           # 技能工具集
│   ├── code-reviewer/    # 代码审查技能
│   ├── commit-helper/    # 提交信息生成
│   ├── pr-creator/       # PR 创建技能
│   └── skill-creator/    # 技能创建工具
└── settings.json    # Claude Code 主配置
```

### 🌍 [KissTranslator](./KissTranslator/)

自定义翻译 API 配置

**特性**:

- 🔌 多翻译服务 API 支持
- 🎣 自定义钩子和扩展
- 📚 详细使用示例和文档
- 🚀 高性能翻译优化

### 🚁 [PX4](./PX4/)

[PX4-Autopilot](https://github.com/PX4/PX4-Autopilot) 无人机仿真环境

> **✅ 测试版本**: PX4 v1.12.3

**配置步骤**:

1. 修改脚本中的源码和构建目录路径
2. 运行环境初始化脚本：
   ```bash
   source setup_px4_autopilot.sh
   ```

### ⚡ [Lazygit](./Lazygit/)

Lazygit 终端 Git 工具配置

**特色功能**:

- 🎨 优化键位绑定
- 📊 可视化提交历史
- ⚡ 快速分支管理

### 🛠️ [Terminal](./Terminal/)

终端工具配置集合

**包含工具**:

- **WezTerm** - 现代终端模拟器配置
- **Windows Terminal** - 相关配置和主题

### 💻 [VSCode](./VSCode/)

Visual Studio Code 编辑器配置

**配置亮点**:

- 🎨 精选主题和字体配置
- 🔧 生产力提升扩展设置
- 📝 代码格式化规则
- 🚀 调试环境优化

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
cp ~/.bash_aliases ~/.bash_aliases.backup

# 备份 VSCode 配置
cp ~/.config/Code/User/settings.json ~/.config/Code/User/settings.json.backup
```

### 3️⃣ 安装配置文件

#### Bash 环境配置

```bash
# 复制配置文件
cp Bash/.bashrc ~/.bashrc
cp Bash/.bash_aliases ~/.bash_aliases
cp Bash/.bash_profile ~/.bash_profile
cp Bash/.bash_function ~/.bash_function

# 重新加载配置
source ~/.bashrc
```

#### VSCode 配置

```bash
# 创建配置目录（如果不存在）
mkdir -p ~/.config/Code/User

# 复制配置文件
cp VSCode/settings.json ~/.config/Code/User/
```

#### Claude Code 配置

```bash
# 创建 Claude Code 配置目录
mkdir -p ~/.claude

# 复制所有配置文件
cp -r ClaudeCode/* ~/.claude/
```

#### 终端配置

```bash
# WezTerm 配置
cp Terminal/WezTerm/.wezterm.lua ~/.wezterm.lua
```

### 4️⃣ 安装必要依赖

#### 字体安装

```bash
# 安装 Nerd Fonts（以 Ubuntu 为例）
sudo apt update
sudo apt install fonts-firacode
```

#### 工具安装

```bash
# 安装基础工具
sudo apt install git curl wget

# 安装 Node.js（某些配置需要）
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## 📖 详细配置

### Claude Code 代理系统

Claude Code 代理系统是本配置的核心特色，提供智能化的编程辅助：

#### 使用方法

1. **安装 Claude Code**: 参考 [Claude Code 官方文档](https://docs.anthropic.com/claude/docs/claude-code)
2. **配置代理**: 复制 ClaudeCode 目录到 `~/.claude/`
3. **开始使用**: 在 Claude Code 中享受专业化的 AI 代理服务

#### 代理类型

- **核心代理**: 代码审查、性能优化、文档生成
- **通用代理**: 后端开发、前端开发、API 设计
- **专业代理**: C++ 专家、Python 专家、安全专家等

### Clash 代理配置

详细的 Clash 配置说明请参考 [Clash/README.md](./Clash/README.md)

## 🔧 自定义配置

### 添加个人配置

```bash
# 在 .bashrc 中添加个人别名
echo "alias myproject='cd /path/to/my/project'" >> ~/.bashrc

# 在 VSCode 中添加个人设置
echo '  "terminal.integrated.fontFamily": "Fira Code Retina",' >> ~/.config/Code/User/settings.json
```

### 配置同步

```bash
# 创建同步脚本
cat > sync_config.sh << 'EOF'
#!/bin/bash
# 同步配置到新机器的脚本

CONFIG_DIR="$HOME/Config"
BACKUP_DIR="$HOME/Config_backup"

# 备份现有配置
mkdir -p $BACKUP_DIR

# 同步配置文件
rsync -av $CONFIG_DIR/Bash/ ~/
rsync -av $CONFIG_DIR/VSCode/ ~/.config/Code/User/
rsync -av $CONFIG_DIR/ClaudeCode/ ~/.claude/

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
4. **🌟 推荐项目**: 给项目点星支持

### 提交规范

- 使用清晰的提交信息
- 遵循现有的代码风格
- 添加必要的文档说明
- 确保配置文件可正常工作

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)。

### 🙏 致谢

本项目包含以下开源项目的部分代码：

- [awesome-claude-agents](https://github.com/vijaythecoder/awesome-claude-agents) - MIT License
- [skills](https://github.com/anthropics/skills) - Apache License 2.0

感谢这些项目的贡献者们！

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by [RanFR](https://github.com/RanFR)

</div>
