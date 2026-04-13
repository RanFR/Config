# =============================================================================
# 提示符配置
# =============================================================================
# 此文件定义了终端提示符 PS1 的所有相关功能

# 检测是否为chroot环境，用于prompt
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
	debian_chroot=$(cat /etc/debian_chroot)
fi

# 检测终端颜色支持
case "$TERM" in
xterm-color | *-256color) color_prompt=yes ;;
esac

# =============================================================================
# Git 相关函数
# =============================================================================

# 获取 Git 分支名称和状态并输出
git_info() {
	# 检查是否在 Git 仓库中
	if ! git rev-parse --git-dir >/dev/null 2>&1; then
		return
	fi

	# 获取分支名称
	local branch=$(git symbolic-ref --short HEAD 2>/dev/null)

	# 分支存在，则输出分支；否则获取标签或者提交哈希
	if [ -z "$branch" ]; then
		# 如果不是分支，获取标签或提交哈希
		branch=$(git describe --tags --exact-match HEAD 2>/dev/null || git rev-parse --short HEAD 2>/dev/null)
		if [ -n "$branch" ]; then
			echo "   ${branch}"
			return
		fi
		return
	fi

	# 输出 Git 信息（红色）
	echo "   ${branch}"
}

# =============================================================================
# Python 虚拟环境检测
# =============================================================================

# 获取 Python 虚拟环境类型并输出
venv_info() {
	local env_type
	if [ -n "$VIRTUAL_ENV" ]; then
		# 标准虚拟环境
		env_type="VENV"
	elif [ -n "$CONDA_DEFAULT_ENV" ] || [ -n "$CONDA_PREFIX" ]; then
		# Conda 环境
		env_type="CONDA"
	else
		return
	fi

	echo "   🐍${env_type}"
}

# =============================================================================
# 构建最终的提示符
# =============================================================================

if [ "$color_prompt" = yes ]; then
	PS1='${debian_chroot:+($debian_chroot)}\[\033[01;34m\]\u\[\033[00m\]@\[\033[01;32m\]\h\[\033[00m\]   \[\033[01;35m\]\w\[\033[00m\]\[\033[01;31m\]$(git_info)\[\033[00m\]\[\033[01;33m\]$(venv_info)\[\033[00m\]\n❯ '
else
	PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w\$ '
fi

# 取消多余的命令
unset color_prompt

# 如果是xterm，则额外设置标题栏user@host:dir
case "$TERM" in
xterm* | rxvt*)
	PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
	;;
*) ;;
esac
