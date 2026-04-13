# =============================================================================
# 命令别名配置
# =============================================================================
# 此文件包含常用的命令别名，用于提高工作效率

# =============================================================================
# 基础命令增强
# =============================================================================

# ls 系列别名 - 列出目录内容
alias ls='ls --color=auto --group-directories-first'
alias ll='ls -alF --color=auto --group-directories-first'
alias la='ls -A --color=auto --group-directories-first'
alias lsg='ls -l --color=auto | grep' # 列出并过滤

# cd 系列别名 - 目录导航
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias ~='cd ~' # 快速回到主目录

# 磁盘使用
alias du='du -h'                # 人类可读格式
alias dua='du -sh'              # 显示目录总大小
alias dush='du -sh * | sort -h' # 按大小排序

# grep 系列别名 - 搜索增强
alias grep='grep --color=auto --exclude-dir={.bzr,CVS,.git,.hg,.svn}'

# =============================================================================
# Git 别名
# =============================================================================

# 基础 Git 命令
alias gc="git clone"
alias gf="git fetch"
alias gl="git log"
alias gs='git status'
alias gp='git pull'
alias gpp='git push'
alias gsu='git submodule update --init --recursive'

# =============================================================================
# 系统管理别名
# =============================================================================

# 进程管理
alias ps='ps auxf'
alias top='htop 2>/dev/null || top' # 优先使用 htop

# 网络相关
alias ping='ping -c 4'      # 默认只 ping 4 次

# 系统信息
alias df='df -h'
alias free='free -h'

# =============================================================================
# 开发相关别名
# =============================================================================

# Python 相关
alias py='python3'
alias pip='pip3'
alias activate='source .venv/bin/activate'

# ROS 相关
alias cb='catkin_make --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON'
alias cbr='catkin_make --cmake-args -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON'

# =============================================================================
# 实用工具别名
# =============================================================================

# 压缩解压
alias mktar='tar --auto-compress -cf'
alias untar='tar -xf'
alias lstar='tar -tf'

# 安全命令
alias rm='rm -I'        # 删除多个文件时提示确认
alias cp='cp -iv'       # 复制时提示确认
alias mv='mv -iv'       # 移动时提示确认
alias mkdir='mkdir -pv' # 创建目录时创建父目录

# 快速重载配置
alias reload='source ~/.bashrc'
alias reload!='echo "Restarting bash..." && exec bash' # 完全重新启动 bash
