# If not running interactively, don't do anything
case $- in
  *i*) ;;
    *) return;;
esac

# History settings
# Set the maximum number of lines in the history file
HISTSIZE=1000
# Set the maximum number of lines in the history file on disk
HISTFILESIZE=2000
# Don't put duplicate lines or lines starting with space in the history.
HISTCONTROL=ignoreboth
# Append to the history file, don't overwrite it
shopt -s histappend

# Check the window size after each command and.
# If necessary, update the values of LINES and COLUMNS.
shopt -s checkwinsize

# Make less more friendly for non-text input files, see lesspipe(1)
[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

# Set variable identifying the chroot you work in
if [ -z "${debian_chroot:-}" ] && [ -r /etc/debian_chroot ]; then
  debian_chroot=$(cat /etc/debian_chroot)
fi

# Bash function
if [ -f ~/.bash_function ]; then
  source ~/.bash_function
fi

# Set a fancy prompt (non-color, unless we know we "want" color)
case "$TERM" in
  xterm-color|*-256color) color_prompt=yes;;
esac

if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
  # We have color support; assume it's compliant with Ecma-48
  # (ISO/IEC-6429). (Lack of such support is extremely rare, and such
  # a case would tend to support setf rather than setaf.)
  color_prompt=yes
else
  color_prompt=
fi

if [ "$color_prompt" = yes ]; then
  PS1='${debian_chroot:+($debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]   \[\033[01;34m\]\w\[\033[00m\]   \[\033[01;36m\]$(parse_git_branch)\[\033[00m\]\n\[\033[01;33m\]➔\[\033[00m\] '
else
  PS1='${debian_chroot:+($debian_chroot)}\u@\h:\w $(parse_git_branch)\n➔ '
fi
unset color_prompt

# If this is an xterm set the title to user@host:dir
case "$TERM" in
xterm*|rxvt*)
  PS1="\[\e]0;${debian_chroot:+($debian_chroot)}\u@\h: \w\a\]$PS1"
  ;;
*)
  ;;
esac

# Alias definitions.
if [ -f ~/.bash_aliases ]; then
  . ~/.bash_aliases
fi

# Ros environment setup
source /opt/ros/noetic/setup.bash
# Disable ROS1 Rviz EOL warnings
export DISABLE_ROS1_EOL_WARNINGS=true

# ACADOS
if [[ ":$LD_LIBRARY_PATH:" != *":$HOME/.local/lib:"* ]]; then
  export LD_LIBRARY_PATH="${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}$HOME/.local/lib"
fi
export ACADOS_SOURCE_DIR="$HOME/.local"

# Nvidia Isaac
export ISAACSIM_PATH="$HOME/Softwares/IsaacSim"

# NVM
export GEM_HOME="$HOME/.gem"

# CUDA
if [[ ":$PATH:" != *":/usr/local/cuda/bin:"* ]]; then
  export PATH=${PATH}:/usr/local/cuda/bin
fi
if [[ ":$LD_LIBRARY_PATH:" != *":/usr/local/cuda/lib:"* ]]; then
  export LD_LIBRARY_PATH="${LD_LIBRARY_PATH:+$LD_LIBRARY_PATH:}/usr/local/cuda/lib"
fi
