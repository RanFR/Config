#!/bin/bash

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
alias .....='cd ../../../..'
alias ~='cd ~'
alias cd.='cd $(pwd)' # 刷新当前目录

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
alias gc='git commit'
alias gs='git status'
alias gb='git branch'
alias gm='git merge'
alias gp='git pull'
alias gpp='git push'
alias gsu='git submodule update --init --recursive --progress'
alias gcl='git clone'

# =============================================================================
# 系统管理别名
# =============================================================================

# 进程管理
alias ps='ps auxf'
alias psg='ps aux | grep -v grep | grep'
alias killall='killall -v'
alias top='htop 2>/dev/null || top' # 优先使用 htop

# 网络相关
alias ping='ping -c 4'            # 默认只 ping 4 次
alias myip='curl -s ipinfo.io/ip' # 获取外网 IP
alias ports='netstat -tuln'       # 查看监听端口
alias connections='ss -tuln'      # 使用 ss 替代 netstat

# 系统信息
alias df='df -h'
alias free='free -h'
alias uptime='uptime -p'
alias meminfo='free -m -l -t'
alias psproc='ps -ef | grep'

# 权限管理
alias chmodx='chmod +x'
alias chmodr='chmod -R'
alias chownr='chown -R'

# =============================================================================
# 开发相关别名
# =============================================================================

# Python 相关
alias py='python3'
alias pip='pip3'
alias venv='python3 -m venv'
alias activate='source .venv/bin/activate'

# Node.js 相关
alias node='node'
alias npm='npm'
alias npx='npx'
alias yarn='yarn'
alias serve='python3 -m http.server'

# Docker 相关
alias d='docker'
alias dc='docker-compose'
alias dps='docker ps'
alias dpsa='docker ps -a'
alias di='docker images'
alias drm='docker rm'
alias drmi='docker rmi'
alias dexec='docker exec -it'

# ROS（机器人操作系统）
alias cb='catkin_make --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON'
alias cbr='catkin_make --cmake-args -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON'

# =============================================================================
# 实用工具别名
# =============================================================================

# 压缩解压
alias untar='tar -xvf'
alias mktar='tar -cvf'
alias mktgz='tar -czvf'
alias untgz='tar -xzvf'

# 时间日期
alias now='date +"%T"'
alias today='date +"%Y-%m-%d"'
alias timestamp='date +"%Y%m%d_%H%M%S"'

# 安全命令
alias rm='rm -I'        # 删除多个文件时提示确认
alias cp='cp -iv'       # 复制时提示确认
alias mv='mv -iv'       # 移动时提示确认
alias mkdir='mkdir -pv' # 创建目录时创建父目录

# =============================================================================
# 主题美化别名
# =============================================================================

# 彩色手册页
if [ -x /usr/bin/man ]; then
	man() {
		env \
			LESS_TERMCAP_mb=$(printf "\e[1;31m") \
			LESS_TERMCAP_md=$(printf "\e[1;31m") \
			LESS_TERMCAP_me=$(printf "\e[0m") \
			LESS_TERMCAP_se=$(printf "\e[0m") \
			LESS_TERMCAP_so=$(printf "\e[1;44;33m") \
			LESS_TERMCAP_ue=$(printf "\e[0m") \
			LESS_TERMCAP_us=$(printf "\e[1;32m") \
			man "$@"
	}
fi

# 快速编辑配置文件
alias bashrc='nvim ~/.bashrc'
alias bashrcd='nvim ~/.bashrc.d/'

# 快速重载配置
alias reload='. ~/.bashrc'
alias reload!='echo "Restarting bash..." && exec bash' # 完全重新启动 bash
