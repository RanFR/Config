#!/bin/bash

# =============================================================================
# 提示符配置
# =============================================================================
# 此文件定义了终端提示符 PS1 的所有相关功能

# 加载颜色配置（如果还未加载）
if [ -z "$HAS_COLOR" ]; then
	source "$HOME/.bashrc.d/colors.sh"
fi

# 为 Readline 标记非打印序列，避免长命令回显错位
ps1_wrap() {
	local seq=$1
	[ -z "$seq" ] && return
	printf '\\[%s\\]' "$seq"
}

# =============================================================================
# Git 相关函数
# =============================================================================

# 获取 Git 分支名称和状态
git_info() {
	local c_reset=$(ps1_wrap "$RESET")
	local c_bold=$(ps1_wrap "$BOLD")
	local c_dim=$(ps1_wrap "$DIM")
	local c_git=$(ps1_wrap "$COLOR_GIT")
	local c_git_clean=$(ps1_wrap "$COLOR_GIT_CLEAN")
	local c_git_dirty=$(ps1_wrap "$COLOR_GIT_DIRTY")
	local c_git_staged=$(ps1_wrap "$COLOR_GIT_STAGED")
	local c_warn=$(ps1_wrap "$COLOR_WARNING")
	local c_err=$(ps1_wrap "$COLOR_ERROR")

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
			printf "%s%s➤%s %s%s%s%s" "$c_dim" "$c_git" "$c_reset" "$c_bold" "$c_git" "$branch" "$c_reset"
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
	local status_color="$c_git_clean"

	if [ "$conflicted_count" -gt 0 ]; then
		status_color="$c_err"
		status_indicator=" ${c_bold}${c_err}✖${conflicted_count}${c_reset}"
	elif [ "$staged_count" -gt 0 ] || [ "$modified_count" -gt 0 ] || [ "$untracked_count" -gt 0 ]; then
		status_color="$c_git_dirty"

		[ "$staged_count" -gt 0 ] && status_indicator="${status_indicator} ${c_git_staged}●${staged_count}${c_reset}"
		[ "$modified_count" -gt 0 ] && status_indicator="${status_indicator} ${c_git_dirty}✚${modified_count}${c_reset}"
		[ "$untracked_count" -gt 0 ] && status_indicator="${status_indicator} ${c_warn}?${untracked_count}${c_reset}"
	fi

	# 获取远程分支状态（ahead/behind）
	local remote_info=""
	local tracking_branch=$(git for-each-ref --format='%(upstream:short)' "refs/heads/$branch" 2>/dev/null)
	if [ -n "$tracking_branch" ]; then
		local ahead=$(git rev-list --count "$tracking_branch..$branch" 2>/dev/null)
		local behind=$(git rev-list --count "$branch..$tracking_branch" 2>/dev/null)

		if [ "$ahead" -gt 0 ] || [ "$behind" -gt 0 ]; then
			remote_info=" ${c_dim}"
			[ "$ahead" -gt 0 ] && remote_info="${remote_info}↑${ahead}"
			[ "$behind" -gt 0 ] && remote_info="${remote_info}↓${behind}"
			remote_info="${remote_info}${c_reset}"
		fi
	fi

	# 输出完整的 Git 信息
	printf "%s%s%s%s%s%s%s" "$c_git" "$c_reset" "$c_bold" "$status_color" "$branch" "$c_reset" "$status_indicator$remote_info"
}

# =============================================================================
# Python 虚拟环境检测
# =============================================================================

# 获取 Python 虚拟环境名称
venv_info() {
	local c_venv=$(ps1_wrap "$COLOR_VENV")
	local c_reset=$(ps1_wrap "$RESET")

	if [ -n "$VIRTUAL_ENV_PROMPT" ]; then
		# UV 环境
		printf "%s🐍 %s%s" "$c_venv" "$VIRTUAL_ENV_PROMPT" "$c_reset"
		return
	elif [ -n "$CONDA_DEFAULT_ENV" ]; then
		# Conda 环境
		printf "%s🐍 %s%s" "$c_venv" "$CONDA_DEFAULT_ENV" "$c_reset"
	elif [ -n "$VIRTUAL_ENV" ]; then
		# 标准虚拟环境
		local venv_name=$(basename "$VIRTUAL_ENV")
		printf "%s🐍 %s%s" "$c_venv" "$venv_name" "$c_reset"
	fi
}


# =============================================================================
# 目录信息
# =============================================================================

# 获取缩短的路径显示
smart_path() {
	local c_path=$(ps1_wrap "$COLOR_PATH")
	local c_reset=$(ps1_wrap "$RESET")

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
		read -r -a parts <<< "$path"
		local last_index=$(( ${#parts[@]} - 1 ))
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

	printf "%s%s%s" "$c_path" "$path" "$c_reset"
}

# 显示目录内容统计
dir_stats() {
	if [ -t 1 ] && command -v find >/dev/null 2>&1 && command -v wc >/dev/null 2>&1; then
		local files=$(find . -maxdepth 1 -type f 2>/dev/null | wc -l)
		local dirs=$(find . -maxdepth 1 -type d 2>/dev/null | wc -l)
		dirs=$((dirs - 1)) # 排除当前目录
		local c_dim=$(ps1_wrap "$DIM")
		local c_blue=$(ps1_wrap "$BLUE")
		local c_reset=$(ps1_wrap "$RESET")
		printf "%s%s[${dirs}d, ${files}f]%s" "$c_dim" "$c_blue" "$c_reset"
	fi
}

# =============================================================================
# 主机信息
# =============================================================================

# 获取主机名和用户信息
host_info() {
	local c_reset=$(ps1_wrap "$RESET")
	local c_bold=$(ps1_wrap "$BOLD")
	local c_error=$(ps1_wrap "$COLOR_ERROR")
	local c_user=$(ps1_wrap "$COLOR_USER")
	local c_host=$(ps1_wrap "$COLOR_HOST")
	local c_symbol=$(ps1_wrap "$COLOR_SYMBOL")

	local user=$(whoami)
	local host=$(hostname)
	local ssh_indicator=""

	# 如果是通过 SSH 连接，添加 SSH 图标
	if [ -n "$SSH_CLIENT" ] || [ -n "$SSH_TTY" ]; then
		ssh_indicator="${c_symbol}🌐 "
	fi

	# 如果是 root 用户，使用红色警告
	if [ "$EUID" -eq 0 ]; then
		printf "%s%s%s%s%s@%s%s%s%s" \
			"$ssh_indicator" "$c_bold" "$c_error" "$user" "$c_reset" "$c_bold" "$c_error" "$host" "$c_reset"
	else
		printf "%s%s%s%s%s@%s%s%s%s" \
			"$ssh_indicator" "$c_bold" "$c_user" "$user" "$c_reset" "$c_bold" "$c_host" "$host" "$c_reset"
	fi
}

# =============================================================================
# 构建最终的提示符
# =============================================================================

# 构建多行提示符
build_prompt() {
	# 确保所有输出都重定向，避免干扰命令行
	{
		# 第一部分：用户@主机
		local part1="$(host_info 2>/dev/null)"

		# 第二部分：当前目录
		local part2="   $(smart_path 2>/dev/null)"

		# 第三部：Git、虚拟环境、目录统计等
		local part3=""
		local git_info_output=$(git_info 2>/dev/null)
		[ -n "$git_info_output" ] && part3="${part3}   ${git_info_output}"
		local venv_info_output=$(venv_info 2>/dev/null)
		[ -n "$venv_info_output" ] && part3="${part3}   ${venv_info_output}"

		# 组合所有行
		PS1=""

		# 主提示符内容
		PS1="${PS1}${part1}${part2}${part3}\n"

		# 提示符符号
		if [ "$EUID" -eq 0 ]; then
			local c_bold=$(ps1_wrap "$BOLD")
			local c_error=$(ps1_wrap "$COLOR_ERROR")
			local c_reset=$(ps1_wrap "$RESET")
			PS1="${PS1}${c_bold}${c_error}#${c_reset} "
		else
			local c_bold=$(ps1_wrap "$BOLD")
			local c_symbol=$(ps1_wrap "$COLOR_SYMBOL")
			local c_reset=$(ps1_wrap "$RESET")
			PS1="${PS1}${c_bold}${c_symbol}❯${c_reset} "
		fi

		# 设置窗口标题
		case "$TERM" in
		xterm* | rxvt* | screen* | tmux*)
			# 设定标题所用的用户与主机，并移除路径中的 ANSI 颜色
			local title_user=$(whoami 2>/dev/null)
			local title_host=$(hostname 2>/dev/null)
			local title=$(pwd 2>/dev/null | sed "s|^$HOME|~|")
			# 设置窗口标题 - 使用 \033 而不是 \e
			PS1="\[\033]0;${title_user}@${title_host}: ${title}\007\]${PS1}"
			;;
		esac
	} 2>/dev/null
}

# 设置 PROMPT_COMMAND 来动态构建提示符
# 确保函数没有任何输出干扰命令行
PROMPT_COMMAND="{ build_prompt; } 2>/dev/null"
