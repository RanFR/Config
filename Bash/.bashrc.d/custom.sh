#!/bin/bash

# Acados
case ":${LD_LIBRARY_PATH}:" in
*:"$HOME/.local/lib":*) ;;
*)
	export LD_LIBRARY_PATH="$LD_LIBRARY_PATH:$HOME/.local/lib"
	;;
esac
export ACADOS_INSTALL_DIR="$HOME/.local"

# Astral uv
if command -v uv >/dev/null 2>&1; then
	eval "$(uv generate-shell-completion bash)"
fi

# >>> conda initialize >>>
# !! Contents within this block are managed by 'conda init' !!
__conda_setup="$('$HOME/ProgramFiles/Miniconda3/bin/conda' 'shell.bash' 'hook' 2>/dev/null)"
if [ $? -eq 0 ]; then
	eval "$__conda_setup"
else
	if [ -f "$HOME/ProgramFiles/Miniconda3/etc/profile.d/conda.sh" ]; then
		. "$HOME/ProgramFiles/Miniconda3/etc/profile.d/conda.sh"
	else
		export PATH="$HOME/ProgramFiles/Miniconda3/bin:$PATH"
	fi
fi
unset __conda_setup
# <<< conda initialize <<<

# CUDA
case ":${PATH}:" in
*:"/usr/local/cuda/bin":*) ;;
*)
	export PATH=${PATH}:/usr/local/cuda/bin
	;;
esac
case ":${LD_LIBRARY_PATH}:" in
*:"/usr/local/cuda/lib":*) ;;
*)
	export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/cuda/lib"
	;;
esac

# NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && source "$NVM_DIR/bash_completion" # This loads nvm bash_completion

# ROS
. /opt/ros/noetic/setup.bash
# 禁用ROS1 Rviz的EOL警告
export DISABLE_ROS1_EOL_WARNINGS=true

# Rust
. "$HOME/.cargo/env"

# TexLive
case ":${PATH}:" in
*:"/usr/local/texlive/2025/bin/x86_64-linux":*) ;;
*)
	export PATH="${PATH}:/usr/local/texlive/2025/bin/x86_64-linux"
	;;
esac
