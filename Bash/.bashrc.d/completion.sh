#!/bin/bash

# =============================================================================
# 基础补全设置
# =============================================================================

# 启用 bash-completion（如果存在）
if ! shopt -oq posix; then
	if [ -f /usr/share/bash-completion/bash_completion ]; then
		. /usr/share/bash-completion/bash_completion
	elif [ -f /etc/bash_completion ]; then
		. /etc/bash_completion
	fi
fi

# 启用编程相关补全
complete -cf sudo
complete -cf which
complete -cf whereis
complete -cf man
complete -A command -o default nohup
complete -A command -o default exec
complete -A command -o default nice
complete -A command -o default strace
complete -A command -o default ltrace
complete -A command -o default screen

# =============================================================================
# 高级补全设置
# =============================================================================

# 启用不区分大小写的补全
bind 'set completion-ignore-case on'

# 显示所有可能的补全
bind 'set show-all-if-ambiguous on'

# 补全时显示列表
bind 'set show-all-if-unmodified on'

# 添加尾部斜杠补全目录名
bind 'set mark-directories on'

# 补全时显示被删除的字符
bind 'set visible-stats on'
