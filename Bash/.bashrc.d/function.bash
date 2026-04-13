# =============================================================================
# 自定义函数
# =============================================================================
# 此文件包含常用的自定义函数，扩展 shell 功能

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
		wget --progress=bar "$url" -O "$output"
	elif command -v curl >/dev/null 2>&1; then
		curl -L --progress-bar "$url" -o "$output"
	else
		echo "Neither wget nor curl is available"
		return 1
	fi
}

# ============================================================================
# 代理开关函数
# ============================================================================

# 开启 Proxy 代理
proxyon() {
	PROXY_URL="http://example.com:port"
	NO_PROXY_URL="localhost,127.0.0.1"
	export http_proxy="${PROXY_URL}"
	export https_proxy="${PROXY_URL}"
	export HTTP_PROXY="${PROXY_URL}"
	export HTTPS_PROXY="${PROXY_URL}"
	export no_proxy="${NO_PROXY_URL}"
	export NO_PROXY="${NO_PROXY_URL}"
	echo "Proxy enabled: ${PROXY_URL}"
	unset PROXY_URL NO_PROXY_URL
}

# 关闭 Proxy 代理
proxyoff() {
	unset http_proxy https_proxy HTTP_PROXY HTTPS_PROXY no_proxy NO_PROXY
	echo "Proxy disabled"
}
