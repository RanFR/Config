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
		[ "$untracked_count" -gt 0 ] && status_indicator="${status_indicator} ${COLOR_WARNING}…${untracked_count}${RESET}"
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
	echo -e "${COLOR_GIT}${RESET} ${BOLD}${status_color}${branch}${RESET}${status_indicator}${remote_info}"
}

# =============================================================================
# Python 虚拟环境检测
# =============================================================================

# 获取 Python 虚拟环境名称
venv_info() {
	if [ -n "$VIRTUAL_ENV" ]; then
		local venv_name=$(basename "$VIRTUAL_ENV")
		echo -e "${COLOR_VENV}🐍 ${venv_name}${RESET}"
	fi
}

# =============================================================================
# 命令执行时间
# =============================================================================

# 记录命令开始时间
timer_start() {
	timer=${timer:-$SECONDS}
}

# 记录命令结束时间并显示耗时
timer_stop() {
	timer_show=$((SECONDS - timer))
	unset timer
}

# 设置 trap 以捕获命令
trap 'timer_start' DEBUG
PROMPT_COMMAND='timer_stop'

# 格式化执行时间显示
format_timer() {
	if [ "${timer_show:-0}" -gt 0 ]; then
		local hours=$((timer_show / 3600))
		local minutes=$(((timer_show % 3600) / 60))
		local seconds=$((timer_show % 60))

		local time_str=""
		if [ "$hours" -gt 0 ]; then
			time_str="${hours}h "
		fi
		if [ "$minutes" -gt 0 ]; then
			time_str="${time_str}${minutes}m "
		fi
		time_str="${time_str}${seconds}s"

		echo -e "${DIM}${COLOR_TIME}⏱ ${time_str}${RESET}"
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
		local parts=(${path//\// })
		local new_path=""

		if [ "$path" = "${path#/}" ]; then
			# 相对路径
			new_path="${parts[0]}/.../${parts[-1]}"
		else
			# 绝对路径
			new_path="/${parts[1]}/.../${parts[-1]}"
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
# 终端状态
# =============================================================================

# 显示上一条命令的退出状态
last_command_status() {
	local status=$?
	if [ "$status" -ne 0 ]; then
		echo -e "${BOLD}${COLOR_ERROR}✖ ${status}${RESET} "
	fi
}

# =============================================================================
# 构建最终的提示符
# =============================================================================

# 构建多行提示符
build_prompt() {
	# 第一行：用户@主机 和路径
	local line1="$(host_info) $(smart_path)"

	# 第二行：Git、虚拟环境、目录统计等
	local line2=""
	local git_info_output=$(git_info)
	[ -n "$git_info_output" ] && line2="${line2} ${git_info_output}"

	local venv_info_output=$(venv_info)
	[ -n "$venv_info_output" ] && line2="${line2} ${venv_info_output}"

	# 第三行：时间和命令状态
	local line3=""
	local timer_output=$(format_timer)
	[ -n "$timer_output" ] && line3="${line3} ${timer_output}"

	local status_output=$(last_command_status)
	[ -n "$status_output" ] && line3="${status_output}${line3}"

	# 组合所有行
	PS1=""

	# 添加命令执行时间在提示符之前
	if [ -n "$timer_output" ]; then
		PS1="${timer_output}\n"
	fi

	# 主提示符内容
	PS1="${PS1}${line1}${line2}\n"

	# 提示符符号
	if [ "$EUID" -eq 0 ]; then
		PS1="${PS1}${BOLD}${COLOR_ERROR}#${RESET} "
	else
		PS1="${PS1}${BOLD}${COLOR_SYMBOL}❯${RESET} "
	fi

	# 设置窗口标题
	case "$TERM" in
	xterm* | rxvt* | screen* | tmux*)
		local title=$(smart_path | sed 's/\x1b\[[0-9;]*m//g') # 移除 ANSI 颜色代码
		PS1="\[\e]0;${user}@${host}: ${title}\a\]${PS1}"
		;;
	esac
}

# 设置 PROMPT_COMMAND 来动态构建提示符
PROMPT_COMMAND="build_prompt; $PROMPT_COMMAND"
