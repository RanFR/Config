# Aliases for common commands
alias ls='ls --color=auto'
alias ll='ls -alF'
alias la='ls -A'
alias grep='grep --color=auto'

# du
alias dush="du -sh * | sort -h"

# Git
alias gc="git clone"
alias gsu="git submodule update --init --recursive --progress"

# Ros catkin_make
alias cm="catkin_make --cmake-args -DCMAKE_EXPORT_COMPILE_COMMANDS=ON"
alias cmr="catkin_make --cmake-args -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON"
