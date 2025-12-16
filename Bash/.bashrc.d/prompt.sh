#!/bin/bash

# =============================================================================
# 提示符配置
# =============================================================================
# 此文件定义了终端提示符 PS1 的所有相关功能

# 加载颜色配置（如果还未加载）
if [ -z "$HAS_COLOR" ]; then
	source "$HOME/.bashrc.d/colors.sh"
fi

# =============================================================================
# Git 相关函数
# =============================================================================

# 获取 Git 分支名称和状态
git_info() {
	# 检查是否在 Git 仓库中
	if ! git rev-parse --git-dir >/dev/null 2>&1; then
		return
	fi

	# 获取分支名称
	local branch=$(git symbolic-ref --short HEAD 2>/dev/null)
	if [ -z "$branch" ]; then
		# 如果不是分支，获取标签或提交哈希
		branch=$(git describe --tags --exact-match HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
		if [ -n "$branch" ]; then
			echo -e "${DIM}${COLOR_GIT}➤${RESET} ${BOLD}${COLOR_GIT}${branch}${RESET}"
			return
		fi
		return
	fi

	# 检查是否有未提交的更改
	local status_output=$(git status --porcelain 2>/dev/null)
	local staged_count=0
	local modified_count=0
	local untracked_count=0
	local conflicted_count=0

	# 统计各种状态的文件数量
	while IFS= read -r line; do
		if [ -n "$line" ]; then
			local index="${line:0:1}"
			local worktree="${line:1:1}"

			case "$index$worktree" in
			"??") untracked_count=$((untracked_count + 1)) ;;
			"DD" | "AU" | "UD" | "UA" | "DU" | "UU" | "AA") conflicted_count=$((conflicted_count + 1)) ;;
			*)
				if [ "$index" != " " ]; then
					staged_count=$((staged_count + 1))
				fi
				if [ "$worktree" != " " ]; then
					modified_count=$((modified_count + 1))
				fi
				;;
			esac
		fi
	done <<<"$status_output"

	# 构建状态指示器
	local status_indicator=""
	local status_color="$COLOR_GIT_CLEAN"

	if [ "$conflicted_count" -gt 0 ]; then
		status_color="$COLOR_ERROR"
		status_indicator=" ${BOLD}${COLOR_ERROR}✖${conflicted_count}${RESET}"
	elif [ "$staged_count" -gt 0 ] || [ "$modified_count" -gt 0 ] || [ "$untracked_count" -gt 0 ]; then
		status_color="$COLOR_GIT_DIRTY"

		[ "$staged_count" -gt 0 ] && status_indicator="${status_indicator} ${COLOR_GIT_STAGED}●${staged_count}${RESET}"
		[ "$modified_count" -gt 0 ] && status_indicator="${status_indicator} ${COLOR_GIT_DIRTY}✚${modified_count}${RESET}"
		[ "$untracked_count" -gt 0 ] && status_indicator="${status_indicator} ${COLOR_WARNING}?${untracked_count}${RESET}"
	fi

	# 获取远程分支状态（ahead/behind）
	local remote_info=""
	local tracking_branch=$(git for-each-ref --format='%(upstream:short)' "refs/heads/$branch" 2>/dev/null)
	if [ -n "$tracking_branch" ]; then
		local ahead=$(git rev-list --count "$tracking_branch..$branch" 2>/dev/null)
		local behind=$(git rev-list --count "$branch..$tracking_branch" 2>/dev/null)

		if [ "$ahead" -gt 0 ] || [ "$behind" -gt 0 ]; then
			remote_info=" ${DIM}"
			[ "$ahead" -gt 0 ] && remote_info="${remote_info}↑${ahead}"
			[ "$behind" -gt 0 ] && remote_info="${remote_info}↓${behind}"
			remote_info="${remote_info}${RESET}"
		fi
	fi

	# 输出完整的 Git 信息
	echo -e "${COLOR_GIT}${RESET}${BOLD}${status_color}${branch}${RESET}${status_indicator}${remote_info}"
}

# =============================================================================
# Python 虚拟环境检测
# =============================================================================

# 获取 Python 虚拟环境名称
venv_info() {
	if [ -n "$VIRTUAL_ENV_PROMPT" ]; then
		# UV 环境
		echo -e "${COLOR_VENV}🐍 ${VIRTUAL_ENV_PROMPT}${RESET}"
		return
	elif [ -n "$CONDA_DEFAULT_ENV" ]; then
		# Conda 环境
		echo -e "${COLOR_VENV}🐍 ${CONDA_DEFAULT_ENV}${RESET}"
	elif [ -n "$VIRTUAL_ENV" ]; then
		# 标准虚拟环境
		local venv_name=$(basename "$VIRTUAL_ENV")
		echo -e "${COLOR_VENV}🐍 ${venv_name}${RESET}"
	fi
}

# =============================================================================
# 目录信息
# =============================================================================

# 获取缩短的路径显示
smart_path() {
	local path=$(pwd)
	local home=$HOME

	# 将 home 目录替换为 ~
	if [[ "$path" == "$home"* ]]; then
		path="~${path#$home}"
	fi

	# 如果路径太长，缩短中间部分
	local max_length=40
	if [ ${#path} -gt "$max_length" ]; then
		# 使用 / 分割为数组，保留绝对路径时首元素为空的特性
		local IFS='/'
		local parts=()
		read -r -a parts <<<"$path"
		local last_index=$((${#parts[@]} - 1))
		local first=""
		local last="${parts[$last_index]}"
		local new_path=""

		if [[ "$path" = "${path#/}" ]]; then
			# 非以 / 开头（相对路径或以 ~ 开头）
			first="${parts[0]}"
			new_path="${first}/.../${last}"
		else
			# 以 / 开头的绝对路径，parts[1] 为第一个目录名
			first="${parts[1]}"
			new_path="/${first}/.../${last}"
		fi
		path="$new_path"
	fi

	echo -e "${COLOR_PATH}${path}${RESET}"
}

# 显示目录内容统计
dir_stats() {
	if [ -t 1 ] && command -v find >/dev/null 2>&1 && command -v wc >/dev/null 2>&1; then
		local files=$(find . -maxdepth 1 -type f 2>/dev/null | wc -l)
		local dirs=$(find . -maxdepth 1 -type d 2>/dev/null | wc -l)
		dirs=$((dirs - 1)) # 排除当前目录
		echo -e "${DIM}${COLOR_BLUE}[${dirs}d, ${files}f]${RESET}"
	fi
}

# =============================================================================
# 主机信息
# =============================================================================

# 获取主机名和用户信息
host_info() {
	local user=$(whoami)
	local host=$(hostname)
	local ssh_indicator=""

	# 如果是通过 SSH 连接，添加 SSH 图标
	if [ -n "$SSH_CLIENT" ] || [ -n "$SSH_TTY" ]; then
		ssh_indicator="${COLOR_SYMBOL}🌐 "
	fi

	# 如果是 root 用户，使用红色警告
	if [ "$EUID" -eq 0 ]; then
		echo -e "${ssh_indicator}${BOLD}${COLOR_ERROR}${user}${RESET}@${BOLD}${COLOR_ERROR}${host}${RESET}"
	else
		echo -e "${ssh_indicator}${BOLD}${COLOR_USER}${user}${RESET}@${BOLD}${COLOR_HOST}${host}${RESET}"
	fi
}

# =============================================================================
# 构建最终的提示符
# =============================================================================

# 构建多行提示符
build_prompt() {
	# 第一部分：用户@主机
	local part1="$(host_info)"

	# 第二部分：当前目录
	local part2="   $(smart_path)"

	# 第三部：Git、虚拟环境、目录统计等
	local part3=""
	local git_info_output=$(git_info)
	[ -n "$git_info_output" ] && part3="${part3}   ${git_info_output}"
	local venv_info_output=$(venv_info)
	[ -n "$venv_info_output" ] && part3="${part3}   ${venv_info_output}"

	# 组合所有行
	PS1=""

	# 主提示符内容
	PS1="${PS1}${part1}${part2}${part3}\n"

	# 提示符符号
	if [ "$EUID" -eq 0 ]; then
		PS1="${PS1}${BOLD}${COLOR_ERROR}#${RESET} "
	else
		PS1="${PS1}${BOLD}${COLOR_SYMBOL}❯${RESET} "
	fi

	# 设置窗口标题
	case "$TERM" in
	xterm* | rxvt* | screen* | tmux*)
		# 设定标题所用的用户与主机，并移除路径中的 ANSI 颜色
		local title_user=$(whoami)
		local title_host=$(hostname)
		local title=$(smart_path | sed 's/\x1b\[[0-9;]*m//g')
		# 设置窗口标题
		PS1="\[\e]0;${title_user}@${title_host}: ${title}\a\]${PS1}"
		;;
	esac
}

# 设置 PROMPT_COMMAND 来动态构建提示符
PROMPT_COMMAND="build_prompt"
