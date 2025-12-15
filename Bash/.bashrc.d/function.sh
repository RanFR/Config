#!/bin/bash

# =============================================================================
# 自定义函数
# =============================================================================
# 此文件包含常用的自定义函数，扩展 shell 功能

# 加载颜色配置（如果还未加载）
if [ -z "$HAS_COLOR" ]; then
	source "$HOME/.bashrc.d/colors.sh"
fi

# =============================================================================
# 目录和文件操作
# =============================================================================

# 创建目录并进入
mkcd() {
	if [ $# -eq 0 ]; then
		echo "Usage: mkcd <directory>"
		return 1
	fi
	mkdir -p "$1" && cd "$1"
}

# 创建并进入临时目录
tmpcd() {
	local temp_dir=$(mktemp -d)
	cd "$temp_dir"
	echo "Created temp directory: $temp_dir"
}

# 显示目录树结构并统计
treeinfo() {
	if command -v tree >/dev/null 2>&1; then
		tree -aC -L 2 --dirsfirst "$@" | head -n -2
		echo
		local dirs=$(find "$1" -maxdepth 1 -type d 2>/dev/null | wc -l)
		local files=$(find "$1" -maxdepth 1 -type f 2>/dev/null | wc -l)
		echo "Total: $((dirs - 1)) directories, $files files"
	else
		ls -la "$@"
	fi
}

# =============================================================================
# Git 相关函数
# =============================================================================

# 解析 Git 分支（保留原函数以兼容）
parse_git_branch() {
	branch=$(git symbolic-ref --short HEAD 2>/dev/null)
	if [ -n "$branch" ]; then
		# 显示分支名称
		echo "$branch"
	else
		# 分离头状态，尝试获取标签或提交哈希
		ref=$(git describe --tags --exact-match HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
		if [ -n "$ref" ]; then
			echo "➤ $ref" # 使用不同的符号表示分离状态
		fi
	fi
}

# =============================================================================
# 网络相关函数
# =============================================================================

# 下载文件并显示进度
download() {
	if [ $# -eq 0 ]; then
		echo "Usage: download <url> [output_file]"
		return 1
	fi

	local url=$1
	local output=${2:-$(basename "$url")}

	if command -v wget >/dev/null 2>&1; then
		wget --progress=bar:force "$url" -O "$output"
	elif command -v curl >/dev/null 2>&1; then
		curl -L --progress-bar "$url" -o "$output"
	else
		echo "Neither wget nor curl is available"
		return 1
	fi
}
