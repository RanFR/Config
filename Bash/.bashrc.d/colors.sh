#!/bin/bash

# =============================================================================
# 颜色配置
# =============================================================================
# 此文件定义了终端中使用的所有颜色变量和颜色相关函数

# 检测终端是否支持颜色
if [ -t 1 ]; then
	HAS_COLOR=1
else
	HAS_COLOR=0
fi

# 检测终端背景色（明暗主题）
detect_theme() {
	if [ "$COLORFGBG" ]; then
		# 从 COLORFGBG 环境变量获取
		case "$COLORFGBG" in
		*0* | *1* | *2* | *3* | *4* | *5* | *6* | *7*) echo "light" ;;
		*) echo "dark" ;;
		esac
	elif command -v tput >/dev/null 2>&1; then
		# 使用 tput 检测
		if [ "$(tput colors)" -ge 256 ]; then
			# 尝试读取背景色
			bg=$(
				tput setab 7
				echo -n " "
				tput sgr0
			)
			if [ "$bg" = " " ]; then
				echo "dark"
			else
				echo "light"
			fi
		else
			echo "dark"
		fi
	else
		echo "dark"
	fi
}

# 主题检测
THEME=$(detect_theme)

# =============================================================================
# 基础颜色定义
# =============================================================================

# 重置颜色
if [ "$HAS_COLOR" -eq 1 ]; then
	RESET=$(tput sgr0)
	BOLD=$(tput bold)
	DIM=$(tput dim)
	UNDERLINE=$(tput smul)
	BLINK=$(tput blink)
	REVERSE=$(tput rev)
	INVISIBLE=$(tput invis)
fi

# 前景色
if [ "$HAS_COLOR" -eq 1 ]; then
	BLACK=$(tput setaf 0)
	RED=$(tput setaf 1)
	GREEN=$(tput setaf 2)
	YELLOW=$(tput setaf 3)
	BLUE=$(tput setaf 4)
	MAGENTA=$(tput setaf 5)
	CYAN=$(tput setaf 6)
	WHITE=$(tput setaf 7)

	# 明亮颜色
	BRIGHT_BLACK=$(tput setaf 8)
	BRIGHT_RED=$(tput setaf 9)
	BRIGHT_GREEN=$(tput setaf 10)
	BRIGHT_YELLOW=$(tput setaf 11)
	BRIGHT_BLUE=$(tput setaf 12)
	BRIGHT_MAGENTA=$(tput setaf 13)
	BRIGHT_CYAN=$(tput setaf 14)
	BRIGHT_WHITE=$(tput setaf 15)

	# 256色扩展
	ORANGE=$(tput setaf 202)
	PINK=$(tput setaf 205)
	PURPLE=$(tput setaf 141)
	LIME=$(tput setaf 120)
	TEAL=$(tput setaf 37)
	INDIGO=$(tput setaf 99)
else
	# 无颜色时的替代方案
	RESET=""
	BOLD=""
	DIM=""
	UNDERLINE=""
	BLINK=""
	REVERSE=""
	INVISIBLE=""

	BLACK=""
	RED=""
	GREEN=""
	YELLOW=""
	BLUE=""
	MAGENTA=""
	CYAN=""
	WHITE=""

	BRIGHT_BLACK=""
	BRIGHT_RED=""
	BRIGHT_GREEN=""
	BRIGHT_YELLOW=""
	BRIGHT_BLUE=""
	BRIGHT_MAGENTA=""
	BRIGHT_CYAN=""
	BRIGHT_WHITE=""

	ORANGE=""
	PINK=""
	PURPLE=""
	LIME=""
	TEAL=""
	INDIGO=""
fi

# =============================================================================
# 主题相关颜色
# =============================================================================

if [ "$THEME" = "light" ]; then
	# 浅色主题
	COLOR_USER=$BLUE
	COLOR_HOST=$GREEN
	COLOR_PATH=$PURPLE
	COLOR_GIT=$ORANGE
	COLOR_GIT_CLEAN=$GREEN
	COLOR_GIT_DIRTY=$RED
	COLOR_GIT_STAGED=$YELLOW
	COLOR_VENV=$PURPLE
	COLOR_SYMBOL=$CYAN
	COLOR_TIME=$BRIGHT_BLACK
	COLOR_ERROR=$RED
	COLOR_WARNING=$YELLOW
	COLOR_SUCCESS=$GREEN
else
	# 深色主题
	COLOR_USER=$GREEN
	COLOR_HOST=$CYAN
	COLOR_PATH=$BRIGHT_BLUE
	COLOR_GIT=$ORANGE
	COLOR_GIT_CLEAN=$GREEN
	COLOR_GIT_DIRTY=$RED
	COLOR_GIT_STAGED=$YELLOW
	COLOR_VENV=$PURPLE
	COLOR_SYMBOL=$YELLOW
	COLOR_TIME=$BRIGHT_BLACK
	COLOR_ERROR=$RED
	COLOR_WARNING=$YELLOW
	COLOR_SUCCESS=$GREEN
fi

# =============================================================================
# 颜色工具函数
# =============================================================================

# 彩色 echo 函数
cecho() {
	local color=$1
	shift
	if [ "$HAS_COLOR" -eq 1 ]; then
		echo -e "${color}$@${RESET}"
	else
		echo "$@"
	fi
}

# 错误信息输出
error() {
	cecho "$COLOR_ERROR" "✖ $@" >&2
}

# 警告信息输出
warn() {
	cecho "$COLOR_WARNING" "⚠ $@"
}

# 成功信息输出
success() {
	cecho "$COLOR_SUCCESS" "✔ $@"
}

# 信息输出
info() {
	cecho "$COLOR_BLUE" "ℹ $@"
}

# 高亮显示
highlight() {
	cecho "$BOLD$COLOR_YELLOW" "$@"
}

# =============================================================================
# 特殊效果
# =============================================================================

# 渐变效果函数（用于特殊场合）
gradient() {
	local text=$1
	if [ "$HAS_COLOR" -eq 1 ] && command -v python3 >/dev/null 2>&1; then
		python3 -c "
import sys
colors = [196, 202, 208, 214, 220, 226]
text = '$text'
output = ''
for i, char in enumerate(text):
    color_idx = i % len(colors)
    output += f'\033[38;5;{colors[color_idx]}m{char}'
print(output + '\033[0m')
        "
	else
		echo "$text"
	fi
}

# 彩虹文字效果
rainbow() {
	local text=$1
	if [ "$HAS_COLOR" -eq 1 ]; then
		local colors=("$RED" "$ORANGE" "$YELLOW" "$GREEN" "$BLUE" "$INDIGO" "$PURPLE")
		local output=""
		local i=0
		for ((i = 0; i < ${#text}; i++)); do
			local char="${text:$i:1}"
			local color_index=$((i % ${#colors[@]}))
			output+="${colors[$color_index]}$char"
		done
		echo -e "${output}${RESET}"
	else
		echo "$text"
	fi
}

# =============================================================================
# 导出颜色变量供其他脚本使用
# =============================================================================
export HAS_COLOR THEME RESET BOLD DIM UNDERLINE
export BLACK RED GREEN YELLOW BLUE MAGENTA CYAN WHITE
export BRIGHT_BLACK BRIGHT_RED BRIGHT_GREEN BRIGHT_YELLOW BRIGHT_BLUE BRIGHT_MAGENTA BRIGHT_CYAN BRIGHT_WHITE
export ORANGE PINK PURPLE LIME TEAL INDIGO
export COLOR_USER COLOR_HOST COLOR_PATH COLOR_GIT COLOR_GIT_CLEAN COLOR_GIT_DIRTY COLOR_GIT_STAGED
export COLOR_VENV COLOR_SYMBOL COLOR_TIME COLOR_ERROR COLOR_WARNING COLOR_SUCCESS
