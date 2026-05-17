# Bash

这是一套面向交互式 Bash 的个人配置，采用数字前缀分层模块结构管理环境变量、PATH、别名、函数、补全和提示符。模块按文件名字典序自动加载，职责清晰、易于维护和迁移。

## 目录结构

```text
Bash/
├── .profile
├── bash/
│   ├── 00-env
│   ├── 10-path
│   ├── 20-alias
│   ├── 30-function
│   ├── 40-completion
│   └── 50-prompt
├── bashrc
└── README.md
```

## 各文件职责

### `bashrc`

交互式 Bash 的主入口，只在交互 shell 中生效。它负责：

- 检测当前 shell 是否为交互式，非交互式则直接退出
- 通过 `BASH_SOURCE` 计算配置目录的相对路径
- 按数字前缀顺序加载 `bash/` 中的所有模块（`[0-9][0-9]-*`）
- 配置目录不存在时输出错误并回退到默认 PS1

### `.profile`

登录 shell 的环境初始化文件。它负责：

- 在 Bash 启动时自动加载 `~/.bashrc`
- 将 `~/.local/bin` 加入 `PATH`

### `bash/00-env`

环境变量与基础设置模块，负责：

- 设置历史记录选项：`HISTSIZE`、`HISTFILESIZE`、`HISTCONTROL`（`ignoreboth:erasedups`）
- 启用 `histappend`、`cmdhist`、`lithist`、`checkwinsize`
- 设置 XDG 目录变量：`XDG_CONFIG_HOME`、`XDG_CACHE_HOME`、`XDG_DATA_HOME`、`XDG_STATE_HOME`
- 自动检测默认编辑器（优先 `code --wait`，其次 `nano`）
- 设置工具目录变量：`ACADOS_SOURCE_DIR`、`OPENCODE_BIN_DIR`
- 加载 `~/.config/secrets/env` 中的敏感环境变量

### `bash/10-path`

PATH 管理模块，负责：

- 提供 `path_add` 辅助函数，支持 prepend（默认）和 append 模式，自动去重
- 管理 `PATH`：`~/.local/bin`、`/usr/local/cuda/bin`、`OPENCODE_BIN_DIR`
- 管理 `LD_LIBRARY_PATH`：`ACADOS_SOURCE_DIR/lib`、`/usr/local/cuda/lib`

### `bash/20-alias`

别名集中管理，包含：

- 文件列表：`ls`、`ll`、`la`
- 目录导航：`..`、`...`、`....`
- 磁盘查看：`du`、`dua`
- Git 快捷操作：`gs`、`gp`、`gpp`、`gf`、`gl`、`gc`、`gsu`
- 系统工具：`ping`、`df`、`free`
- Python：`py`、`pip`、`activate`
- ROS：`cm`、`cmr`
- 配置重载：`reload`

### `bash/30-function`

自定义函数集合，提供：

- `mkcd`：创建目录并进入
- `tmpcd`：创建临时目录并进入
- `proxyon` / `proxyoff`：开关代理环境变量
- `mktar` / `untar` / `lstar`：归档创建、解压、查看

### `bash/40-completion`

Bash 补全配置，负责：

- 加载系统级 bash-completion
- 加载 `uv` 的 shell 补全

### `bash/50-prompt`

提示符配置模块，负责：

- 检测 chroot 环境
- 检测终端颜色支持
- 构建彩色 PS1 提示符（用户@主机、工作目录）
- 设置 xterm 兼容终端的标题栏

## 加载顺序

配置加载顺序由文件名数字前缀控制，`bashrc` 使用 glob `[0-9][0-9]-*` 按字典序自动排序加载：

1. `00-env` — 环境变量和基础设置最先就绪
2. `10-path` — PATH 管理，依赖 `00-env` 中定义的变量
3. `20-alias` — 别名，无外部依赖
4. `30-function` — 函数，无外部依赖
5. `40-completion` — 补全，依赖 PATH 已配置
6. `50-prompt` — 提示符，最后加载以使用完整环境

这种顺序保证：基础环境先就绪，PATH 和工具链随后可用，最后才是 UI 层。

## 使用说明

部署到用户主目录：

```bash
cp bashrc ~/.bashrc
cp -r bash ~/.bash
```

重新加载配置：

```bash
source ~/.bashrc
```

或使用别名：

```bash
reload
```

## 依赖与注意事项

- `bashrc` 使用相对路径定位配置目录，部署后配置目录为 `~/.bash/`
- 提示符中的颜色需要终端支持 256 color
- `40-completion` 中 `uv` 补全仅在 `uv` 已安装时生效
- `10-path` 中的 `path_add` 会自动跳过已存在的路径，避免重复
- `00-env` 中部分工具路径（acados、cuda 等）是固定的，本机不存在时不会报错，但相关功能不会生效
- `.profile` 仅在登录 shell 中执行

## 自定义建议

- 想添加环境变量时，编辑 `bash/00-env`
- 想添加 PATH 或 `LD_LIBRARY_PATH` 时，使用 `path_add` 函数，编辑 `bash/10-path`
- 想添加个人别名时，编辑 `bash/20-alias`
- 想添加 shell 函数时，编辑 `bash/30-function`
- 想添加工具补全时，编辑 `bash/40-completion`
- 想调整提示符样式时，编辑 `bash/50-prompt`
- 想添加全新的配置类别时，创建新文件并使用合适的数字前缀，例如 `bash/25-docker`

## 维护原则

- 保持 `bashrc` 尽量简洁，只负责加载编排
- 模块按职责单一原则拆分，避免单文件膨胀
- 新增配置遵循数字前缀命名，插入到合适的加载位置
- 使用 `path_add` 管理 PATH，避免手动拼接导致重复
