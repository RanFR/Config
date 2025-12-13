# =============================================================================
# Bash 交互模式检查
# =============================================================================
# 如果不是交互模式，不执行任何操作
case $- in
*i*) ;;
*) return ;;
esac

# =============================================================================
# 基础配置
# =============================================================================

# 历史记录设置
# 设置内存中保存的命令数量
HISTSIZE=5000
# 设置历史文件中保存的命令数量
HISTFILESIZE=10000
# 忽略重复命令和以空格开头的命令
HISTCONTROL=ignoreboth:erasedups
# 追加而不是覆盖历史文件
shopt -s histappend
# 多行命令保存为单条记录
shopt -s cmdhist
# 检查并更新终端窗口大小
shopt -s checkwinsize

# less 增强配置
# 使 less 更好地处理非文本文件
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# Chroot 环境标识
# 设置标识以识别当前是否在 chroot 环境中工作
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
	debian_chroot=$(cat /etc/debian_chroot)
fi

# =============================================================================
# 模块化配置加载
# =============================================================================
# 按特定顺序加载配置文件，确保依赖关系正确
if [ -d "$HOME/.bashrc.d" ]; then
	# 首先加载基础配置（颜色等）
	for config_file in "$HOME/.bashrc.d"/colors.sh; do
		[ -f "$config_file" ] && . "$config_file"
	done

	# 然后加载功能配置
	for config_file in "$HOME/.bashrc.d"/{completion,function,aliases}.sh; do
		[ -f "$config_file" ] && . "$config_file"
	done

	# 最后加载提示符配置（依赖颜色配置）
	for config_file in "$HOME/.bashrc.d"/prompt.sh; do
		[ -f "$config_file" ] && . "$config_file"
	done

	# 确保提示符已设置（如果没有则设置一个基本的提示符）
	if [ -z "$PS1" ]; then
		PS1='\u@\h:\w\$ '
	fi

	# 加载其他自定义配置
	for config_file in "$HOME/.bashrc.d"/*.sh; do
		# 跳过已加载的文件
		case "$(basename "$config_file")" in
		colors | prompt | completion | function | aliases) continue ;;
		*)
			[ -f "$config_file" ] && . "$config_file"
			;;
		esac
	done
else
	# 如果 .bashrc.d 目录不存在，使用基本提示符
	PS1='\u@\h:\w\$ '
fi

# =============================================================================
# 环境变量配置
# =============================================================================

# 代理配置
PROXY_CFG="http://example.com:port"
NO_PROXY_CFG="localhost,127.0.0.1,::1"
export HTTP_PROXY=${PROXY_CFG}
export HTTPS_PROXY=${PROXY_CFG}
export http_proxy=${PROXY_CFG}
export https_proxy=${PROXY_CFG}
export NO_PROXY=${NO_PROXY_CFG}
export no_proxy=${NO_PROXY_CFG}
unset PROXY_CFG NO_PROXY_CFG

# 默认编辑器
if command -v nvim >/dev/null 2>&1; then
	export EDITOR=vim
elif command -v nano >/dev/null 2>&1; then
	export EDITOR=nano
fi

# 历史记录时间格式
export HISTTIMEFORMAT="%F %T "

# 禁用 Ctrl+S（终端冻结）
stty -ixon

# =============================================================================
# 可选环境配置
# =============================================================================
# 以下配置根据需要取消注释启用

# ROS（机器人操作系统）
# # source /opt/ros/noetic/setup.bash
# # export DISABLE_ROS1_EOL_WARNINGS=true

# Acados（优化工具包）
# # case ":${LD_LIBRARY_PATH}:" in
# #     *:"$HOME/.local/lib":*)
# #         ;;
# #     *)
# #         export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:$HOME/.local/lib"
# #         ;;
# # esac
# # export ACADOS_SOURCE_DIR="$HOME/.local"

# Astral uv（Python 包管理器）
# # if command -v uv >/dev/null 2>&1; then
# #     eval "$(uv generate-shell-completion bash)"
# # fi

# Nvidia Isaac Sim
# # export ISAACSIM_PATH="$HOME/Softwares/IsaacSim"

# NVM（Node 版本管理器）
# # export NVM_DIR="$HOME/.nvm"
# # [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
# # [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# CUDA（NVIDIA GPU 计算工具包）
# # case ":${PATH}:" in
# #     *:"/usr/local/cuda/bin":*)
# #         ;;
# #     *)
# #         export PATH=${PATH}:/usr/local/cuda/bin
# #         ;;
# # esac
# # case ":${LD_LIBRARY_PATH}:" in
# #     *:"/usr/local/cuda/lib":*)
# #         ;;
# #     *)
# #         export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/cuda/lib"
# #         ;;
# # esac

# Rust 编程语言
# # source "$HOME/.cargo/env"
# # export RUSTUP_UPDATE_ROOT=https://mirrors.cernet.edu.cn/rustup/rustup
# # export RUSTUP_DIST_SERVER=https://mirrors.cernet.edu.cn/rustup

# Flightmare 模拟器
# # export FLIGHTMARE_PATH=$HOME/Projects/Simulator/Flightmare

# =============================================================================
# 终端启动提示
# =============================================================================
# 显示一个欢迎信息，可以通过设置环境变量禁用
if [ "$BASH_STARTUP_MESSAGE" != "false" ] && [ -t 1 ]; then
	# 只在支持的终端显示（避免在 scp、rsync 等情况下显示）
	if [ "$TERM" != "dumb" ] && [ -n "$BASH_VERSION" ]; then
		# 获取系统信息
		if command -v figlet >/dev/null 2>&1; then
			echo -e "${COLOR_BLUE}$(figlet -f small "Welcome back!")${RESET}"
		fi

		# 显示时间
		echo -e "${DIM}${COLOR_TIME}$(date '+%A, %B %d, %Y - %H:%M:%S')${RESET}"

		# 显示系统负载（可选）
		if [ -f /proc/loadavg ]; then
			load=$(cut -d' ' -f1-3 /proc/loadavg)
			echo -e "${DIM}System Load: ${load}${RESET}"
		fi

		echo # 空行分隔
	fi
fi
