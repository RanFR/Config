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
# 系统信息和管理
# =============================================================================

# 显示系统信息摘要
sysinfo() {
	echo -e "${BOLD}${COLOR_BLUE}=== System Information ===${RESET}"
	echo -e "${COLOR_USER}User:${RESET} $(whoami)"
	echo -e "${COLOR_HOST}Hostname:${RESET} $(hostname)"
	echo -e "${COLOR_BLUE}OS:${RESET} $(uname -s -r)"
	echo -e "${COLOR_BLUE}Uptime:${RESET} $(uptime -p)"
	echo -e "${COLOR_BLUE}Disk Usage:${RESET}"
	df -h | grep -E '^/dev/' | while read line; do
		echo "  $line"
	done
	echo -e "${COLOR_BLUE}Memory:${RESET}"
	free -h | grep '^Mem:' | awk '{printf "  Used: %s/%s (%.1f%%)\n", $3, $2, $3/$2*100}'
	echo -e "${COLOR_BLUE}Load Average:${RESET} $(cat /proc/loadavg | cut -d' ' -f1-3)"
}

# 查找占用端口最多的进程
portusage() {
	if command -v netstat >/dev/null 2>&1; then
		netstat -tuln | awk 'NR>2 {print $4}' | cut -d: -f2 | sort | uniq -c | sort -nr
	elif command -v ss >/dev/null 2>&1; then
		ss -tuln | awk 'NR>1 {print $5}' | cut -d: -f2 | sort | uniq -c | sort -nr
	else
		echo "Neither netstat nor ss is available"
	fi
}

# 快速查看进程信息
psinfo() {
	if [ $# -eq 0 ]; then
		echo "Usage: psinfo <process_name>"
		return 1
	fi

	ps aux | grep -v grep | grep "$1" | while read line; do
		local pid=$(echo $line | awk '{print $2}')
		local cpu=$(echo $line | awk '{print $3}')
		local mem=$(echo $line | awk '{print $4}')
		local cmd=$(echo $line | cut -c 79-)

		echo -e "PID: ${COLOR_WARNING}$pid${RESET} | CPU: ${COLOR_WARNING}$cpu%${RESET} | Memory: ${COLOR_WARNING}$mem%${RESET}"
		echo -e "Command: ${DIM}$cmd${RESET}"
		echo
	done
}

# =============================================================================
# 网络相关函数
# =============================================================================

# 网络连接测试
nettest() {
	local hosts=("8.8.8.8" "1.1.1.1" "baidu.com" "github.com")

	echo -e "${BOLD}${COLOR_BLUE}=== Network Connectivity Test ===${RESET}"
	echo

	for host in "${hosts[@]}"; do
		echo -n "Testing $host ... "
		if ping -c 1 -W 2 "$host" >/dev/null 2>&1; then
			echo -e "${COLOR_SUCCESS}OK${RESET}"
		else
			echo -e "${COLOR_ERROR}FAILED${RESET}"
		fi
	done

	echo
	echo -e "${COLOR_BLUE}External IP:${RESET} $(curl -s ipinfo.io/ip 2>/dev/null || echo "Unknown")"
}

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

# =============================================================================
# 实用工具函数
# =============================================================================

# 加密/解密简单文本
encrypt() {
	if [ $# -eq 0 ]; then
		echo "Usage: encrypt <text>"
		return 1
	fi

	echo "$1" | base64 | rev
}

decrypt() {
	if [ $# -eq 0 ]; then
		echo "Usage: decrypt <encrypted_text>"
		return 1
	fi

	echo "$1" | rev | base64 -d
}

# 生成随机密码
genpass() {
	local length=${1:-16}

	if command -v openssl >/dev/null 2>&1; then
		openssl rand -base64 $length | head -c $length
		echo
	else
		# Fallback method
		</dev/urandom tr -dc 'A-Za-z0-9!@#$%^&*()_+' | head -c $length
		echo
	fi
}

# 快速计算器
calc() {
	if [ $# -eq 0 ]; then
		echo "Usage: calc <expression>"
		echo "Example: calc '2 + 2 * 3'"
		return 1
	fi

	# 使用 bc 进行计算
	echo "$1" | bc -l 2>/dev/null || echo "Invalid expression"
}

# 备份文件或目录
backup() {
	if [ $# -eq 0 ]; then
		echo "Usage: backup <file_or_directory> [destination]"
		return 1
	fi

	local source=$1
	local destination=${2:-.}
	local timestamp=$(date +%Y%m%d_%H%M%S)
	local basename=$(basename "$source")

	if [ -f "$source" ]; then
		cp "$source" "$destination/${basename}.backup_$timestamp"
		echo "File backed up: ${basename}.backup_$timestamp"
	elif [ -d "$source" ]; then
		tar -czf "$destination/${basename}.backup_$timestamp.tar.gz" "$source"
		echo "Directory backed up: ${basename}.backup_$timestamp.tar.gz"
	else
		echo "File or directory '$source' does not exist"
	fi
}

# =============================================================================
# 开发辅助函数
# =============================================================================

# 快速创建项目结构
mkproject() {
	if [ $# -eq 0 ]; then
		echo "Usage: mkproject <project_name> [type]"
		echo "Types: python, node, go, rust, cpp"
		return 1
	fi

	local project_name=$1
	local type=${2:-python}

	mkdir -p "$project_name"/{src,docs,tests}

	case "$type" in
	python)
		mkdir -p "$project_name"/{bin,lib}
		touch "$project_name"/requirements.txt
		touch "$project_name"/setup.py
		echo "Created Python project structure"
		;;
	node)
		echo '{"name": "'$project_name'", "version": "1.0.0"}' >"$project_name/package.json"
		echo "Created Node.js project structure"
		;;
	go)
		mkdir -p "$project_name"/{cmd,internal,pkg}
		touch "$project_name"/go.mod
		echo "module $project_name" >"$project_name/go.mod"
		echo "Created Go project structure"
		;;
	rust)
		if command -v cargo >/dev/null 2>&1; then
			cd "$project_name" && cargo init && cd ..
			echo "Created Rust project structure"
		else
			mkdir -p "$project_name"/src
			touch "$project_name/Cargo.toml"
			echo "[package]" >"$project_name/Cargo.toml"
			echo 'name = "'$project_name'"' >>"$project_name/Cargo.toml"
			echo 'version = "0.1.0"' >>"$project_name/Cargo.toml"
			echo "Created Rust project structure (cargo not available)"
		fi
		;;
	cpp)
		mkdir -p "$project_name"/{include,build}
		touch "$project_name/CMakeLists.txt"
		echo "cmake_minimum_required(VERSION 3.10)" >"$project_name/CMakeLists.txt"
		echo "project($project_name)" >>"$project_name/CMakeLists.txt"
		echo "Created C++ project structure"
		;;
	esac

	echo "Project '$project_name' created successfully"
}

# 导出 PATH 变量并显示
showpath() {
	echo -e "${BOLD}${COLOR_BLUE}Current PATH:${RESET}"
	echo $PATH | tr ':' '\n' | nl
}
